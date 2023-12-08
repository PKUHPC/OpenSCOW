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

import { Dataset } from "src/server/entities/Dataset";
import { getORM } from "src/server/lib/db/orm";
import { procedure } from "src/server/trpc/procedure/base";
import { z } from "zod";

const paginationSchema = z.object({
  limit: z.number().min(1).optional(),
  offset: z.number().min(0).optional(),
});

export const list = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/dataset/list",
      tags: ["dataset"],
      summary: "Read all dataset",
    },
  })
  .input(paginationSchema)
  .output(z.object({ items: z.array(z.any()), count: z.number() }))
  .query(async ({ input }) => {
    const orm = await getORM();
    const [items, count] = await orm.em.findAndCount(Dataset, {}, {
      limit: input.limit || 10, // Default limit
      offset: input.offset || 0, // Default offset
      orderBy: { createTime: "desc" },
    });

    return { items, count };
  });


export const createDataset = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/dataset/create",
      tags: ["dataset"],
      summary: "Create a new dataset",
    },
  })
  .input(z.object({
    name: z.string(),
    owner: z.string(),
    type: z.string(),
    scene: z.string(),
    description: z.string(),
  }))
  .output(z.number())
  .mutation(async ({ input }) => {
    const orm = await getORM();
    const dataset = new Dataset(input);
    await orm.em.persistAndFlush(dataset);
    return dataset.id;
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
