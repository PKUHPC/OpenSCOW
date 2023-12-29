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
import { Dataset } from "src/server/entities/Dataset";
import { DatasetVersion } from "src/server/entities/DatasetVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { getORM } from "src/server/utils/getOrm";
import { checkSharePermission, SHARED_DIR, SHARED_TARGET,
  shareFileOrDir, unShareFileOrDir } from "src/server/utils/share";
import { z } from "zod";

import { FileType } from "../file";

// const mockDatasetVersions = [
//   {
//     id: 100,
//     versionName: "version1",
//     owner: "demo_admin",
//     isShared: "true",
//     versionDescription: "test1",
//     path: "/",
//     createTime: "2023-04-15 12:30:45",
//     dataset: 100,
//   },
//   {
//     id: 101,
//     versionName: "version2",
//     owner: "demo_admin",
//     isShared: "true",
//     versionDescription: "test2",
//     path: "/",
//     createTime: "2023-04-15 12:30:45",
//     dataset: 100,
//   },
// ];

export const VersionListSchema = z.object({
  id: z.number(),
  versionName: z.string(),
  isShared: z.boolean(),
  versionDescription: z.string().optional(),
  path: z.string(),
  privatePath: z.string(),
  createTime: z.string(),
  datasetId: z.number(),
});

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
    isShared: z.boolean().optional(),
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
  }))
  .output(z.object({ items: z.array(VersionListSchema), count: z.number() }))
  .query(async ({ input }) => {
    const orm = await getORM();

    const [items, count] = await orm.em.findAndCount(DatasetVersion,
      { dataset: input.datasetId, isShared: input.isShared || { $ne: null } },
      {
        limit: input.pageSize || undefined,
        offset: input.page && input.pageSize ? ((input.page ?? 1) - 1) * input.pageSize : undefined,
        orderBy: { createTime: "desc" },
      });

    return { items: items.map((x) => {
      return {
        id: x.id,
        versionName: x.versionName,
        versionDescription: x.versionDescription,
        privatePath: x.privatePath,
        path: x.path,
        isShared: Boolean(x.isShared),
        createTime: x.createTime ? x.createTime.toISOString() : "",
        datasetId: x.dataset.id,
      }; }), count };
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

    const datasetVersion = new DatasetVersion({ ...input, privatePath: input.path, dataset: dataset });
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
    versionDescription: z.string().optional(),
    datasetId: z.number(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const dataset = await orm.em.findOne(Dataset, { id: input.datasetId });
    if (!dataset)
      throw new TRPCError({ code: "NOT_FOUND", message: `Dataset ${input.datasetId} not found` });

    if (dataset.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Dataset ${input.id} not accessible` });

    const datasetVersion = await orm.em.findOne(DatasetVersion, { id: input.id });
    if (!datasetVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `DatasetVersion ${input.id} not found` });

    datasetVersion.versionName = input.versionName;
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
  .input(z.object({
    id: z.number(),
    datasetId: z.number(),
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const datasetVersion = await orm.em.findOne(DatasetVersion, { id: input.id });

    if (!datasetVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `DatasetVersion ${input.id} not found` });

    const dataset = await orm.em.findOne(Dataset, { id: input.datasetId },
      { populate: ["versions", "versions.isShared"]});
    if (!dataset)
      throw new TRPCError({ code: "NOT_FOUND", message: `Dataset ${input.datasetId} not found` });

    if (dataset.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Dataset ${input.datasetId} not accessible` });

    // 如果是已分享的数据集版本，则删除分享
    if (datasetVersion.isShared) {
      await checkSharePermission({
        clusterId: dataset.clusterId,
        checkedSourcePath: datasetVersion.privatePath,
        user,
        checkedTargetPath: datasetVersion.path,
      });
      await unShareFileOrDir({
        clusterId: dataset.clusterId,
        sharedPath: datasetVersion.path,
        user,
        sharedTarget: SHARED_TARGET.DATASET,
      });
    }

    dataset.isShared = dataset.versions.filter((v) => (v.isShared)).length > 1 ? true : false;
    orm.em.persist(dataset);

    await orm.em.removeAndFlush(datasetVersion);
    await orm.em.flush();
    return { success: true };
  });

export const shareDatasetVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/datasetVersion/share/{id}",
      tags: ["datasetVersion"],
      summary: "share a datasetVersion",
    },
  })
  .input(z.object({
    id: z.number(),
    datasetId: z.number(),
    sourceFilePath: z.string(),
    // fileType: FileType,
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const datasetVersion = await orm.em.findOne(DatasetVersion, { id: input.id });
    if (!datasetVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `DatasetVersion ${input.id} not found` });

    if (datasetVersion.isShared)
      throw new TRPCError({ code: "CONFLICT", message: "DatasetVersion is already shared" });

    const dataset = await orm.em.findOne(Dataset, { id: input.datasetId });
    if (!dataset)
      throw new TRPCError({ code: "NOT_FOUND", message: `Dataset ${input.datasetId} not found` });

    if (dataset.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Dataset ${input.datasetId} not accessible` });

    // 定义分享后目标存储的绝对路径
    const targetName = `${dataset.name}-${user!.identityId}`;
    const targetSubName = `${datasetVersion.versionName}`;
    const targetPath = path.join(SHARED_DIR, SHARED_TARGET.DATASET, targetName, targetSubName);

    datasetVersion.isShared = true;
    datasetVersion.path = targetPath;
    if (!dataset.isShared) { dataset.isShared = true; };

    orm.em.persist(dataset);
    orm.em.persist(datasetVersion);

    await checkSharePermission({
      clusterId: dataset.clusterId,
      checkedSourcePath: datasetVersion.privatePath,
      user,
    });

    await shareFileOrDir({
      clusterId: dataset.clusterId,
      sourceFilePath: input.sourceFilePath,
      user,
      sharedTarget: SHARED_TARGET.DATASET,
      targetName,
      targetSubName,
      // input.fileType,
    });

    await orm.em.flush();
    return { success: true };
  });

export const unShareDatasetVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/datasetVersion/unShare/{id}",
      tags: ["datasetVersion"],
      summary: "unshare a datasetVersion",
    },
  })
  .input(z.object({
    id: z.number(),
    datasetId: z.number(),
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const datasetVersion = await orm.em.findOne(DatasetVersion, { id: input.id });
    if (!datasetVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `DatasetVersion ${input.id} not found` });

    if (!datasetVersion.isShared)
      throw new TRPCError({ code: "CONFLICT", message: "DatasetVersion is already unShared" });

    const dataset = await orm.em.findOne(Dataset, { id: input.datasetId }, {
      populate: ["versions", "versions.isShared"],
    });
    if (!dataset)
      throw new TRPCError({ code: "NOT_FOUND", message: `Dataset ${input.datasetId} not found` });

    if (dataset.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Dataset ${input.datasetId} not accessible` });

    dataset.isShared = dataset.versions.filter((v) => (v.isShared)).length > 1 ? true : false;
    datasetVersion.isShared = false;

    orm.em.persist(dataset);
    orm.em.persist(datasetVersion);

    await checkSharePermission({
      clusterId: dataset.clusterId,
      checkedSourcePath: datasetVersion.privatePath,
      user,
      checkedTargetPath: datasetVersion.path,
    });
    await unShareFileOrDir({
      clusterId: dataset.clusterId,
      sharedPath: dataset.versions.filter((v) => (v.isShared)).length > 1 ?
        datasetVersion.path : path.dirname(datasetVersion.path),
      user,
      sharedTarget: SHARED_TARGET.DATASET,
    });

    await orm.em.flush();
    return { success: true };
  });
