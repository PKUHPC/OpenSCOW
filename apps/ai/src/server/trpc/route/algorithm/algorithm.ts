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
import path, { dirname, join } from "path";
import { Algorithm, Framework } from "src/server/entities/Algorithm";
import { AlgorithmVersion, SharedStatus } from "src/server/entities/AlgorithmVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { ErrorCode } from "src/server/utils/errorCode";
import { getORM } from "src/server/utils/getOrm";
import paginationSchema from "src/server/utils/paginationSchema ";
import { checkSharePermission, SHARED_TARGET, unShareFileOrDir, updateSharedName } from "src/server/utils/share";
import { z } from "zod";


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
    description:z.string(),
    clusterId:z.string(),
    createTime:z.string(),
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
        description:x.description ?? "",
        clusterId:x.clusterId,
        createTime:x.createTime ? x.createTime.toISOString() : "",
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

    if (algorithm.owner !== user!.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Algorithm ${id} not accessible` });


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
      const oldPath = dirname(sharedVersions[0].path);
      await updateSharedName({
        target: SHARED_TARGET.ALGORITHM,
        user: user,
        clusterId: algorithm.clusterId,
        newName: `${name}-${user!.identityId}`,
        isVersionName: false,
        oldPath,
      });

      // 更新已分享的版本的共享文件夹地址
      const topDir = dirname(oldPath);
      const newPathDir = join(topDir, `${name}-${user!.identityId}`);

      sharedVersions.map((v) => {
        v.path = join(newPathDir, v.versionName);
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

    if (algorithm.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Algorithm ${id} not accessible` });

    const algorithmVersions = await em.find(AlgorithmVersion, { algorithm });

    const sharingVersions = algorithmVersions.filter(
      (v) => (v.sharedStatus === SharedStatus.SHARING || v.sharedStatus === SharedStatus.UNSHARING));

    // 有正在分享中或取消分享中的版本，则不可删除
    if (sharingVersions.length > 0) {
      throw new TRPCError(
        { code: "PRECONDITION_FAILED", message: "There is an algorithm version being shared or unshared" });
    }

    const sharedVersions = algorithmVersions.filter((v) => (v.sharedStatus === SharedStatus.SHARED));

    // 删除所有已分享的版本
    let sharedDatasetPath: string = "";
    await Promise.all(sharedVersions.map(async (v) => {
      sharedDatasetPath = path.dirname(v.path);
      await checkSharePermission({
        clusterId: algorithm.clusterId,
        checkedSourcePath: v.privatePath,
        user,
        checkedTargetPath: v.path,
      });
    }));

    // 删除整个分享的dataset路径
    await unShareFileOrDir({
      clusterId: algorithm.clusterId,
      sharedPath: sharedDatasetPath,
      user,
    });

    await em.removeAndFlush([...algorithmVersions, algorithm]);

    return;
  });
