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
import { Algorithm, Framework } from "src/server/entities/Algorithm";
import { Dataset } from "src/server/entities/Dataset";
import { procedure } from "src/server/trpc/procedure/base";
import { ErrorCode } from "src/server/utils/errorCode";
import { getORM } from "src/server/utils/getOrm";
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
    isPublic:z.string().optional(),
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
    versions:z.number(),
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
        versions:3,
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
    const algorithmExsit = await em.findOne(Algorithm, { name:input.name });
    if (algorithmExsit) {
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
    name: z.string(),
    framework: z.nativeEnum(Framework),
    description: z.string().optional(),
  }))
  .mutation(async ({ input:{ name, framework, description } }) => {
    const { em } = await getORM();
    const algorithm = await em.findOne(Algorithm, { name });

    if (!algorithm) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    algorithm.framework = framework;
    algorithm.description = description;

    await em.persistAndFlush(algorithm);
    return;
  });

export const deleteAlgorithm = procedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input:{ id } }) => {
    const { em } = await getORM();
    const algorithm = await em.findOne(Algorithm, { id });

    if (!algorithm) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }
    await em.removeAndFlush(algorithm);
    return;
  });
