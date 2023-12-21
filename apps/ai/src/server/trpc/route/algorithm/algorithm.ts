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

// import { Framework } from "src/models/Algorithm";
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
    isPublic:z.string().optional(),
  }))
  .output(z.object({ items: z.array(z.object({
    id:z.number(),
    name:z.string(),
    owner:z.string(),
    framework:z.nativeEnum(Framework),
    isShared:z.boolean(),
    description:z.string(),
    createTime:z.string(),
    versions:z.number(),
  })), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const { page, pageSize, framework, nameOrDesc, isPublic } = input;

    const [items, count] = await orm.em.findAndCount(Algorithm, {
      ...isPublic ? {} :
        { owner: user!.identityId },
      ...framework ? { framework } : {},
      ...nameOrDesc ?
        { $or: [
          { name: { $like: `%${nameOrDesc}%` } },
          { description: { $like: `%${nameOrDesc}%` } },
        ]} : {},
    },
    {
      ...page ?
        {
          offset: (page - 1) * (pageSize || 10),
          limit: pageSize || 10,
        } : {},
      orderBy: { createTime: "desc" },
    });
    console.log("items", items);
    return { items: items.map((x) => {
      return {
        id:x.id,
        name:x.name,
        owner:x.owner,
        framework:x.framework,
        isShared:x.isShared,
        description:x.description ?? "",
        createTime:x.createTime ? x.createTime.toISOString() : "",
        versions:3,
      }; }), count };
    // return { items: mockAlgorithms, count: 2 };
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
    console.log("algorithmExsit", algorithmExsit);
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

export const deleteDataset = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/dataset/delete/{id}",
      tags: ["dataset"],
      summary: "delete a dataset",
    },
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input }) => {
    const orm = await getORM();
    const dataset = await orm.em.findOne(Dataset, { id: input.id });
    if (!dataset) throw new Error("Dataset not found");
    await orm.em.removeAndFlush(dataset);
    return { success: true };
  });
