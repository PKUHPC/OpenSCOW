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
import { Dataset } from "src/server/entities/Dataset";
import { DatasetVersion } from "src/server/entities/DatasetVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { getORM } from "src/server/utils/getOrm";
import { z } from "zod";

const mockDatasetVersions = [
  {
    id: 100,
    versionName: "version1",
    owner: "demo_admin",
    isShared: "true",
    versionDescription: "test1",
    path: "/",
    createTime: "2023-04-15 12:30:45",
    dataset: 100,
  },
  {
    id: 101,
    versionName: "version2",
    owner: "demo_admin",
    isShared: "true",
    versionDescription: "test2",
    path: "/",
    createTime: "2023-04-15 12:30:45",
    dataset: 100,
  },
];

export const versionList = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/datasetVersion/list/{datasetId}",
      tags: ["datasetVersion"],
      summary: "Read all datasetVersions",
    },
  })
  .input(z.object({
    datasetId: z.number(),
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
  }))
  .output(z.object({ items: z.array(z.any()), count: z.number() }))
  .query(async ({ input }) => {
    const orm = await getORM();

    const [items, count] = await orm.em.findAndCount(DatasetVersion, { dataset: input.datasetId }, {
      populate: ["dataset"],
      limit: input.page,
      offset: input.pageSize,
      orderBy: { createTime: "desc" },
    });

    return { items, count };
    // return { items: mockDatasetVersions, count: 2 };
  });


export const createDatasetVersion = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/datasetVersion/create",
      tags: ["datasetVersion"],
      summary: "Create a new datasetVersion",
    },
  })
  .input(z.object({
    versionName: z.string(),
    path: z.string(),
    versionDescription: z.string().optional(),
    datasetId: z.number(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const dataset = await orm.em.findOne(Dataset, { id: input.datasetId });
    if (!dataset)
      throw new TRPCError({ code: "NOT_FOUND", message: `Dataset ${input.datasetId} not found` });

    if (dataset && dataset.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Dataset ${input.datasetId} not accessible` });

    const datasetVersion = new DatasetVersion({ ...input, dataset: dataset });
    await orm.em.persistAndFlush(datasetVersion);
    return { id: datasetVersion.id };
  });

export const updateDatasetVersion = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/datasetVersion/update/{id}",
      tags: ["dataset"],
      summary: "update a dataset",
    },
  })
  .input(z.object({
    id: z.number(),
    versionName: z.string(),
    path: z.string(),
    versionDescription: z.string().optional(),
    datasetId: z.number(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const dataset = await orm.em.findOne(Dataset, { id: input.datasetId });
    if (!dataset)
      throw new TRPCError({ code: "NOT_FOUND", message: `Dataset ${input.datasetId} not found` });


    const datasetVersion = await orm.em.findOne(DatasetVersion, { id: input.id });
    if (!datasetVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `DatasetVersion ${input.id} not found` });

    datasetVersion.versionName = input.versionName;
    datasetVersion.path = input.path;
    datasetVersion.versionDescription = input.versionDescription;

    await orm.em.flush();
    return { id: datasetVersion.id };
  });

export const deleteDatasetVersion = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/datasetVersion/delete/{id}",
      tags: ["datasetVersion"],
      summary: "delete a new datasetVersion",
    },
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input }) => {
    const orm = await getORM();
    const datasetVersion = await orm.em.findOne(DatasetVersion, { id: input.id });

    if (!datasetVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `DatasetVersion ${input.id} not found` });

    await orm.em.removeAndFlush(datasetVersion);
    return { success: true };
  });
