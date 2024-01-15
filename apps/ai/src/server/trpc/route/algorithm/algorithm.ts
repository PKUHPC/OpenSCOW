/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { TRPCError } from "@trpc/server";
import { basename, dirname, join } from "path";
import { Algorithm, Framework } from "src/server/entities/Algorithm";
import { AlgorithmVersion, SharedStatus } from "src/server/entities/AlgorithmVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { ErrorCode } from "src/server/utils/errorCode";
import { clusterNotFound } from "src/server/utils/errors";
import { getORM } from "src/server/utils/getOrm";
import { paginationSchema } from "src/server/utils/pagination";
import { getUpdatedSharedPath, unShareFileOrDir } from "src/server/utils/share";
import { getClusterLoginNode } from "src/server/utils/ssh";
import { z } from "zod";

import { clusterExist } from "../utils";


export const getAlgorithms = procedure
  .meta({
    openapi: {
      method: "GET",
      // 一般来说，获取所有algorithm的API都是GET /algorithms
      path: "/algorithms/list",
      tags: ["algorithms"],
      summary: "get algorithms",
    },
  })
  .input(z.object({
    ...paginationSchema.shape,
    framework: z.nativeEnum(Framework).optional(),
    nameOrDesc: z.string().optional(),
    clusterId:z.string().optional(),
    isPublic:z.boolean().optional(),
  }))
  .output(z.object({ items: z.array(z.object({
    id:z.number(),
    name:z.string(),
    owner:z.string(),
    framework:z.nativeEnum(Framework),
    isShared:z.boolean(),
    description:z.string().optional(),
    clusterId:z.string(),
    createTime:z.string().optional(),
    versions:z.array(z.string()),
  })), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const { page, pageSize, framework, nameOrDesc, clusterId, isPublic } = input;

    const [items, count] = await orm.em.findAndCount(Algorithm, {
      $and:[
        isPublic ? { isShared:true } :
          { owner: user!.identityId },
        framework ? { framework } : {},
        clusterId ? { clusterId } : {},
        nameOrDesc ?
          { $or: [
            { name: { $like: `%${nameOrDesc}%` } },
            { description: { $like: `%${nameOrDesc}%` } },
          ]} : {},
      ],
    },
    {
      ...page ?
        {
          offset: (page - 1) * (pageSize || 10),
          limit: pageSize || 10,
        } : {},
      populate: ["versions.sharedStatus", "versions.privatePath"],
      orderBy: { createTime: "desc" },
    });

    return { items: items.map((x) => {
      return {
        id:x.id,
        name:x.name,
        owner:x.owner,
        framework:x.framework,
        isShared:x.isShared,
        description:x.description,
        clusterId:x.clusterId,
        createTime:x.createTime ? x.createTime.toISOString() : undefined,
        versions: isPublic ?
          x.versions.filter((x) => (x.sharedStatus === SharedStatus.SHARED)).map((y) => y.path)
          : x.versions.map((y) => y.privatePath),
      }; }), count };

  });


export const createAlgorithm = procedure
  // 这个API没有写openapi
  .input(z.object({
    name: z.string(),
    framework: z.nativeEnum(Framework),
    clusterId: z.string(),
    description: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {

    if (!clusterExist(input.clusterId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cluster id ${input.clusterId} does not exist.`,
      });
    }

    const { em } = await getORM();
    const algorithmExist = await em.findOne(Algorithm, { name:input.name, owner: user!.identityId });
    if (algorithmExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Algorithm name ${input.name} already exist`,
        // cause一般传造成这个错误的子错误，以获取调用栈信息
        // https://trpc.io/docs/server/error-handling#throwing-errors
        // 这里传这个错误码没有意义吧？前端并不能获取到这个信息，直接删掉就好
        cause:ErrorCode.ALGORITHM_NAME_ALREADY_EXIST,
      });
    }

    const algorithm = new Algorithm({ ...input, owner: user!.identityId });
    await em.persistAndFlush(algorithm);
    return algorithm.id;
  });

export const updateAlgorithm = procedure
  // 这个API没有写openapi
  .input(z.object({
    id:z.number(),
    name: z.string(),
    framework: z.nativeEnum(Framework),
    description: z.string().optional(),
  }))
  .mutation(async ({ input:{ name, framework, description, id }, ctx: { user } }) => {
    const { em } = await getORM();
    const algorithm = await em.findOne(Algorithm, { id });

    if (!algorithm) {
      throw new TRPCError({
        code: "NOT_FOUND",
        // error都要写message
      });
    }

    const algorithmExist = await em.findOne(Algorithm, { name });
    if (algorithmExist && algorithmExist !== algorithm) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Algorithm name ${name} already exist`,
        cause: ErrorCode.ALGORITHM_NAME_ALREADY_EXIST,
      });
    }

    if (algorithm.owner !== user.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Algorithm ${id} not accessible` });

    // 存在正在分享或正在取消分享的算法版本，则不可更新名称
    const changingVersions = await em.find(AlgorithmVersion, { algorithm,
      $or: [
        { sharedStatus: SharedStatus.SHARING },
        { sharedStatus: SharedStatus.UNSHARING },
      ]},
    );
    if (changingVersions.length > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `Unfinished processing of algorithm ${id} exists`,
      });
    }

    // 如果是已分享的算法且名称发生变化，则变更共享路径下的此算法名称为新名称
    if (algorithm.isShared && name !== algorithm.name) {

      const sharedVersions = await em.find(AlgorithmVersion, { algorithm, sharedStatus: SharedStatus.SHARED });
      const oldPath = dirname(dirname(sharedVersions[0].path));

      // 获取更新后的当前算法的共享路径名称
      const newAlgorithmSharedPath = await getUpdatedSharedPath({
        clusterId: algorithm.clusterId,
        newName: name,
        oldPath,
      });

      // 更新已分享的版本的共享文件夹地址
      sharedVersions.map((v) => {
        const baseFolderName = basename(v.path);
        const newPath = join(newAlgorithmSharedPath, v.versionName, baseFolderName);

        v.path = newPath;
      });
    }

    algorithm.framework = framework;
    algorithm.name = name;
    algorithm.description = description;

    await em.flush();
    return;
  });

export const deleteAlgorithm = procedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input:{ id }, ctx:{ user } }) => {
    const { em } = await getORM();
    const algorithm = await em.findOne(Algorithm, { id });

    if (!algorithm) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    if (algorithm.owner !== user.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Algorithm ${id} not accessible` });

    const algorithmVersions = await em.find(AlgorithmVersion, { algorithm });

    const sharingVersions = algorithmVersions.filter(
      (v) => (v.sharedStatus === SharedStatus.SHARING || v.sharedStatus === SharedStatus.UNSHARING));

    // 有正在分享中或取消分享中的版本，则不可删除
    if (sharingVersions.length > 0) {
      throw new TRPCError(
        { code: "PRECONDITION_FAILED",
          message: `There is an algorithm version being shared or unshared of algorithm ${id}` });
    }

    const sharedVersions = algorithmVersions.filter((v) => (v.sharedStatus === SharedStatus.SHARED));

    // 获取此算法的共享的算法绝对路径
    const sharedDatasetPath = dirname(dirname(sharedVersions[0].path));

    const host = getClusterLoginNode(algorithm.clusterId);
    if (!host) { throw clusterNotFound(algorithm.clusterId); }

    await unShareFileOrDir({
      host,
      sharedPath: sharedDatasetPath,
    });

    await em.removeAndFlush([...algorithmVersions, algorithm]);

    return;
  });
