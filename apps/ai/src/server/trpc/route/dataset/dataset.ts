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

const mockDatasets = [
  {
    id: 100,
    name: "aaa",
    owner: "demo_admin",
    type: "Image",
    isShared: "true",
    scene: "Text",
    description: "test",
    createTime: "2023-04-15 12:30:45",
    versions: [],
  },
  {
    id: 101,
    name: "bbb",
    owner: "demo_admin",
    type: "Audio",
    isShared: "false",
    scene: "Text",
    description: "test",
    createTime: "2023-04-15 12:30:45",
    versions: [],
  },
];


export const list = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/dataset/list",
      tags: ["dataset"],
      summary: "Read all dataset",
    },
  })
  .input(z.object({
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
    owner: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
  }))
  .output(z.object({ items: z.array(z.any()), count: z.number() }))
  .query(async ({ input }) => {
    const orm = await getORM();
    const [items, count] = await orm.em.findAndCount(Dataset, {
      owner: input.owner || undefined,
      name: input.name || undefined,
      type: input.type || undefined,
      description: input.description || undefined,
    }, {
      limit: input.page || 10, // Default limit
      offset: input.pageSize || 0, // Default offset
      orderBy: { createTime: "desc" },
    });

    // return { items, count };
    return { items: mockDatasets, count: 2 };
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
    description: z.string().optional(),
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
