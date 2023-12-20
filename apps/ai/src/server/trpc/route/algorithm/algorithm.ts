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
import { Algorithm, Framework } from "src/server/entities/Algorithm";
import { Dataset } from "src/server/entities/Dataset";
import { getORM } from "src/server/lib/db/orm";
import { procedure } from "src/server/trpc/procedure/base";
import { z } from "zod";

const mockAlgorithms = [
  {
    id: 100,
    name: "aaa",
    type: "TENSORFLOW",
    owner:"aaa",
    description: "test1",
    createTime: "2023-04-15 12:30:45",
    versions: [1, 2],
  },
  {
    id: 101,
    name: "bbb",
    type: "PYTORCH",
    owner:"bbb",
    description: "test2",
    createTime: "2023-04-19 12:30:45",
    versions: [3, 4, 5],
  },
];


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
    type: z.string().optional(),
    nameOrDescription: z.string().optional(),
  }))
  .output(z.object({ items: z.array(z.any()), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    console.log("user", user);
    // const [items, count] = await orm.em.findAndCount(Dataset, {
    //   owner: input.owner || undefined,
    //   name: input.name || undefined,
    //   type: input.type || undefined,
    //   description: input.description || undefined,
    // }, {
    //   limit: input.page || 10, // Default limit
    //   offset: input.pageSize || 0, // Default offset
    //   orderBy: { createTime: "desc" },
    // });

    // return { items, count };
    return { items: mockAlgorithms, count: 2 };
  });


export const createAlgorithm = procedure
  .input(z.object({
    name: z.string(),
    framework: z.nativeEnum(Framework),
    description: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    // const algorithm = new Algorithm({ ...input, owner: user!.identityId });
    const algorithm = new Algorithm({ name:"123", framework:Framework.KERAS, owner:"wwww" });
    await orm.em.persistAndFlush(algorithm);
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
