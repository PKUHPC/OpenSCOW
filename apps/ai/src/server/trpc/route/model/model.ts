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
import path, { dirname, join } from "path";
import { SharedStatus } from "src/server/entities/AlgorithmVersion";
import { Model } from "src/server/entities/Model";
import { ModelVersion } from "src/server/entities/ModelVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { getORM } from "src/server/utils/getOrm";
import { checkSharePermission, SHARED_TARGET, unShareFileOrDir, updateSharedName } from "src/server/utils/share";
import { z } from "zod";

export const ModelListSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.union([z.string(), z.undefined()]),
  algorithmName: z.string().optional(),
  algorithmFramework: z.string().optional(),
  isShared: z.boolean(),
  versions: z.array(z.string()),
  owner: z.string(),
  clusterId: z.string(),
  createTime: z.string(),
});

export const list = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/models",
      tags: ["model"],
      summary: "list models",
    },
  })
  .input(z.object({
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
    nameOrDesc: z.string().optional(),
    isShared: z.boolean().optional(),
    clusterId: z.string().optional(),
  }))
  .output(z.object({ items: z.array(ModelListSchema), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const isPublicQuery = input.isShared ? {
      isShared: true,
    } : { owner: user?.identityId };

    const nameOrDescQuery = input.nameOrDesc ? {
      $or: [
        { name: { $like: `%${input.nameOrDesc}%` } },
        { description: { $like: `%${input.nameOrDesc}%` } },
      ],
    } : {};

    const clusterQuery = input.clusterId ? {
      clusterId: input.clusterId,
    } : {};

    const [items, count] = await orm.em.findAndCount(Model, {
      ...isPublicQuery,
      ...nameOrDescQuery,
      ...clusterQuery,
    }, {
      limit: input.pageSize || undefined,
      offset: input.page && input.pageSize ? ((input.page ?? 1) - 1) * input.pageSize : undefined,
      populate: ["versions", "versions.sharedStatus", "versions.privatePath"],
      orderBy: { createTime: "desc" },
    });

    return { items: items.map((x) => {
      return {
        id: x.id,
        name: x.name,
        description: x.description,
        algorithmName: x.algorithmName,
        algorithmFramework: x.algorithmFramework,
        isShared: Boolean(x.isShared),
        versions: input.isShared ?
          x.versions.filter((x) => (x.sharedStatus === SharedStatus.SHARED)).map((y) => y.path)
          : x.versions.map((y) => y.privatePath),
        owner: x.owner,
        clusterId: x.clusterId,
        createTime: x.createTime ? x.createTime.toISOString() : "",
      }; }), count };
  });

export const createModel = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/models",
      tags: ["model"],
      summary: "Create a new model",
    },
  })
  .input(z.object({
    name: z.string(),
    algorithmName: z.string().optional(),
    algorithmFramework: z.string().optional(),
    description: z.string().optional(),
    clusterId: z.string(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const modelExist = await orm.em.findOne(Model, { name:input.name, owner: user!.identityId });
    if (modelExist) {
      throw new TRPCError({
        code: "CONFLICT",
      });
    }

    const model = new Model({ ...input, owner: user!.identityId, isShared: false });
    await orm.em.persistAndFlush(model);
    return model.id;
  });

export const updateModel = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/models/{id}",
      tags: ["model"],
      summary: "update a model",
    },
  })
  .input(z.object({
    id: z.number(),
    name: z.string(),
    algorithmName: z.string().optional(),
    algorithmFramework: z.string().optional(),
    description: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const { id, name, algorithmName, algorithmFramework, description } = input;

    const model = await orm.em.findOne(Model, { id });

    const modelExist = await orm.em.findOne(Model, { name });
    if (modelExist && modelExist !== model) {
      throw new TRPCError({
        code: "CONFLICT",
      });
    }

    if (!model) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Model ${input.id} not found` });
    }

    if (model.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Model ${input.id} not accessible` });
    }

    const changingVersions = await orm.em.find(ModelVersion, { model,
      $or: [
        { sharedStatus: SharedStatus.SHARING },
        { sharedStatus: SharedStatus.UNSHARING },
      ]},
    );
    if (changingVersions.length > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `Unfinished processing of model ${input.id} exists`,
      });
    }

    // 如果是已分享的模型且名称发生变化，则变更共享路径下的此模型名称为新名称
    if (model.isShared && name !== model.name) {

      const sharedVersions = await orm.em.find(ModelVersion, { model, sharedStatus: SharedStatus.SHARED });
      const oldPath = dirname(sharedVersions[0].path);
      await updateSharedName({
        target: SHARED_TARGET.MODEL,
        user: user,
        clusterId: model.clusterId,
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

    model.name = name;
    model.algorithmName = algorithmName;
    model.algorithmFramework = algorithmFramework;
    model.description = description;

    await orm.em.flush();
    return model.id;
  });

export const deleteModel = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/models/{id}",
      tags: ["model"],
      summary: "delete a model",
    },
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const model = await orm.em.findOne(Model, { id: input.id });

    if (!model) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Model ${input.id} not found` });
    }

    if (model.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Model ${input.id} not accessible` });
    }
    const modelVersions = await orm.em.find(ModelVersion, { model });

    const sharingVersions = modelVersions.filter(
      (v) => (v.sharedStatus === SharedStatus.SHARING || v.sharedStatus === SharedStatus.UNSHARING));

    // 有正在分享中或取消分享中的版本，则不可删除
    if (sharingVersions.length > 0) {
      throw new TRPCError(
        { code: "PRECONDITION_FAILED", message: "There is an algorithm version being shared or unshared" });
    }

    const sharedVersions = modelVersions.filter((v) => (v.sharedStatus === SharedStatus.SHARED));

    // 删除所有已分享的版本
    let sharedDatasetPath: string = "";
    await Promise.all(sharedVersions.map(async (v) => {
      sharedDatasetPath = path.dirname(v.path);
      await checkSharePermission({
        clusterId: model.clusterId,
        checkedSourcePath: v.privatePath,
        user,
        checkedTargetPath: v.path,
      });
    }));

    // 删除整个分享的dataset路径
    await unShareFileOrDir({
      clusterId: model.clusterId,
      sharedPath: sharedDatasetPath,
      user,
    });

    await orm.em.removeAndFlush([...modelVersions, model]);

    return { success: false };
  });

