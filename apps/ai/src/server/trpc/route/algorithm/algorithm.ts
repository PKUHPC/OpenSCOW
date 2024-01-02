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
import path from "path";
import { Algorithm, Framework } from "src/server/entities/Algorithm";
import { AlgorithmVersion, ShareStatus } from "src/server/entities/AlgorithmVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { ErrorCode } from "src/server/utils/errorCode";
import { getORM } from "src/server/utils/getOrm";
import { checkSharePermission, unShareFileOrDir } from "src/server/utils/share";
import { z } from "zod";


export const getAlgorithms = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/algorithms/list",
      tags: ["algorithms"],
      summary: "get algorithms",
    },
  })
  .input(z.object({
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
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
      populate: ["versions", "versions.sharedStatus", "versions.privatePath"],
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
        versions: isPublic ? x.versions.filter((x) => (x.sharedStatus === ShareStatus.SHARED)).map((y) => y.privatePath)
          : x.versions.map((y) => y.privatePath),
      }; }), count };

  });


export const createAlgorithm = procedure
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
        message: ErrorCode.ALGORITHM_NAME_ALREADY_EXIST,
      });
    }

    const algorithm = new Algorithm({ ...input, owner: user!.identityId });
    await em.persistAndFlush(algorithm);
    return algorithm.id;
  });

export const updateAlgorithm = procedure
  .input(z.object({
    id:z.number(),
    name: z.string(),
    framework: z.nativeEnum(Framework),
    description: z.string().optional(),
  }))
  .mutation(async ({ input:{ name, framework, description, id }, ctx: { user } }) => {
    const { em } = await getORM();
    const algorithm = await em.findOne(Algorithm, { id });

    const algorithmExist = await em.findOne(Algorithm, { name });
    if (algorithmExist !== algorithm) {
      throw new TRPCError({
        code: "CONFLICT",
        message: ErrorCode.ALGORITHM_NAME_ALREADY_EXIST,
      });
    }

    if (!algorithm) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    if (algorithm.owner !== user!.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Algorithm ${id} not accessible` });

    algorithm.framework = framework;
    algorithm.name = name;
    algorithm.description = description;

    await em.persistAndFlush(algorithm);
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

    const sharedVersions = algorithmVersions.filter((v) => (v.sharedStatus === ShareStatus.SHARED));

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
