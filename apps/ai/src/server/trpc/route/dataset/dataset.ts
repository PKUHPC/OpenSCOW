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
import { SharedStatus } from "src/server/entities/AlgorithmVersion";
import { Dataset } from "src/server/entities/Dataset";
import { DatasetVersion } from "src/server/entities/DatasetVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { getORM } from "src/server/utils/getOrm";
import { logger } from "src/server/utils/logger";
import { checkSharePermission, SHARED_TARGET,
  unShareFileOrDir, updateSharedName } from "src/server/utils/share";
import { z } from "zod";

export const DatasetListSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.string(),
  type: z.string(),
  isShared: z.boolean(),
  scene: z.string(),
  description: z.string().optional(),
  clusterId: z.string(),
  createTime: z.string(),
  versions: z.array(z.string()),
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
  .input(z.object({
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
    nameOrDesc: z.string().optional(),
    type: z.string().optional(),
    isShared: z.boolean().optional(),
    clusterId: z.string().optional(),
  }))
  .output(z.object({ items: z.array(DatasetListSchema), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const isPublicQuery = input.isShared ? {
      isShared: true,
      owner: { $ne: null },
    } : { owner: user?.identityId };

    const nameOrDescQuery = input.nameOrDesc ? {
      $or: [
        { name: { $like: `%${input.nameOrDesc}%` } },
        { description: { $like: `%${input.nameOrDesc}%` } },
      ],
    } : {};

    const [items, count] = await orm.em.findAndCount(Dataset, {
      $and: [
        nameOrDescQuery,
        isPublicQuery,
        { type: input.type || { $ne: null },
          clusterId: input.clusterId,
        },
      ],
    }, {
      limit: input.pageSize || undefined,
      offset: input.page && input.pageSize ? ((input.page ?? 1) - 1) * input.pageSize : undefined,
      populate: ["versions.sharedStatus", "versions.privatePath"],
      orderBy: { createTime: "desc" },
    });

    return { items: items.map((x) => {
      return {
        id: x.id,
        name: x.name,
        owner: x.owner,
        type: x.type,
        isShared: Boolean(x.isShared),
        scene: x.scene,
        description: x.description,
        clusterId: x.clusterId,
        createTime: x.createTime ? x.createTime.toISOString() : "",
        versions: input.isShared ?
          x.versions.filter((x) => (x.sharedStatus === SharedStatus.SHARED)).map((y) => y.path) :
          x.versions.map((y) => y.privatePath),
      }; }), count };
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
    type: z.string(),
    scene: z.string(),
    clusterId: z.string(),
    description: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const datesetExist = await orm.em.findOne(Dataset, { name:input.name, owner: user!.identityId });
    if (datesetExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Dataset name ${input.name} already exist`,
      });
    }

    const dataset = new Dataset({ ...input, owner: user!.identityId });
    await orm.em.persistAndFlush(dataset);
    return dataset.id;
  });

export const updateDataset = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/dataset/update/{id}",
      tags: ["dataset"],
      summary: "update a dataset",
    },
  })
  .input(z.object({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    scene: z.string(),
    description: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const { id, name, type, scene, description } = input;

    const dataset = await orm.em.findOne(Dataset, { id });

    if (!dataset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Dataset ${id} not found`,
      });
    };

    if (dataset.owner !== user.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Dataset ${id} not accessible` });

    const nameExist = await orm.em.findOne(Dataset, {
      name,
      owner: user.identityId,
      id: { $ne: input.id },
    });
    if (nameExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Dataset name ${name} duplicated`,
      });
    }

    const changingVersions = await orm.em.find(DatasetVersion, { dataset,
      $or: [
        { sharedStatus: SharedStatus.SHARING },
        { sharedStatus: SharedStatus.UNSHARING },
      ]},
    );
    if (changingVersions.length > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `Unfinished processing of dataset ${id} exists`,
      });
    }

    // 如果是已分享的数据集且名称发生变化，则变更共享路径下的此数据集名称为新名称
    if (dataset.isShared && name !== dataset.name) {

      const sharedVersions = await orm.em.find(DatasetVersion, { dataset, sharedStatus: SharedStatus.SHARED });
      const oldPath = dirname(sharedVersions[0].path);
      await updateSharedName({
        target: SHARED_TARGET.DATASET,
        user: user,
        clusterId: dataset.clusterId,
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

    dataset.name = name;
    dataset.type = type;
    dataset.scene = scene;
    dataset.description = description;

    await orm.em.flush();

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
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const dataset = await orm.em.findOne(Dataset, { id: input.id });
    if (!dataset)
      throw new TRPCError({ code: "NOT_FOUND", message: `Dataset ${input.id} not found` });

    if (dataset.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Dataset ${input.id} not accessible` });

    const datasetVersions = await orm.em.find(DatasetVersion, { dataset });

    try {
      const sharedVersions = datasetVersions.filter((v) => (v.sharedStatus === SharedStatus.SHARED));

      // 删除所有已分享的版本
      let sharedDatasetPath: string = "";
      await Promise.all(sharedVersions.map(async (v) => {
        sharedDatasetPath = path.dirname(v.path);
        await checkSharePermission({
          clusterId: dataset.clusterId,
          checkedSourcePath: v.privatePath,
          user,
          checkedTargetPath: v.path,
        });
      }));

      // 删除整个分享的dataset路径
      await unShareFileOrDir({
        clusterId: dataset.clusterId,
        sharedPath: sharedDatasetPath,
        user,
      }).catch((e) => {
        console.error("Error deleting dataVersions of dataset:", e);
      });

      await orm.em.removeAndFlush([...datasetVersions, dataset]);

      return { success: true };
    } catch (error) {
      // rollback
      console.error("Error deleting dataset:", error);
      return { success: false };
    }
  });
