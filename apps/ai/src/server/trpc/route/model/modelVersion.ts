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

import { getUserHomedir, sftpExists } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import path, { basename, dirname, join } from "path";
import { SharedStatus } from "src/models/common";
import { Model } from "src/server/entities/Model";
import { ModelVersion } from "src/server/entities/ModelVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { checkCopyFile } from "src/server/utils/checkFilePermission";
import { chmod } from "src/server/utils/chmod";
import { copyFile } from "src/server/utils/copyFile";
import { clusterNotFound } from "src/server/utils/errors";
import { getORM } from "src/server/utils/getOrm";
import { logger } from "src/server/utils/logger";
import { paginationSchema } from "src/server/utils/pagination";
import { checkSharePermission, getUpdatedSharedPath, SHARED_TARGET, shareFileOrDir, unShareFileOrDir }
  from "src/server/utils/share";
import { getClusterLoginNode, sshConnect } from "src/server/utils/ssh";
import { z } from "zod";

export const VersionListSchema = z.object({
  id: z.number(),
  modelId: z.number(),
  versionName: z.string(),
  sharedStatus: z.nativeEnum(SharedStatus),
  versionDescription: z.string().optional(),
  algorithmVersion: z.string().optional(),
  path: z.string(),
  privatePath: z.string(),
  createTime: z.string().optional(),
});

export const versionList = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/models/{modelId}/versions",
      tags: ["modelVersions"],
      summary: "Read all modelVersions",
    },
  })
  .input(z.object({
    ...paginationSchema.shape,
    modelId: z.number(),
    isShared: z.boolean().optional(),
  }))
  .output(z.object({ items: z.array(VersionListSchema), count: z.number() }))
  .query(async ({ input }) => {
    const orm = await getORM();

    const [items, count] = await orm.em.findAndCount(ModelVersion,
      {
        model: { id: input.modelId },
        ...input.isShared ? { sharedStatus:SharedStatus.SHARED } : {},
      },
      {
        limit: input.pageSize || undefined,
        offset: input.page && input.pageSize ? ((input.page ?? 1) - 1) * input.pageSize : undefined,
        orderBy: { createTime: "desc" },
      });

    return { items: items.map((x) => {
      return {
        id: x.id,
        modelId: x.model.id,
        versionName: x.versionName,
        versionDescription: x.versionDescription,
        algorithmVersion:x.algorithmVersion,
        path: x.path,
        privatePath: x.privatePath,
        sharedStatus: x.sharedStatus,
        createTime: x.createTime ? x.createTime.toISOString() : undefined,
      }; }), count };
  });

export const createModelVersion = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/models/{modelId}/versions",
      tags: ["modelVersion"],
      summary: "Create a new modelVersion",
    },
  })
  .input(z.object({
    versionName: z.string(),
    versionDescription: z.string().optional(),
    algorithmVersion: z.string().optional(),
    path: z.string(),
    modelId: z.number(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const model = await orm.em.findOne(Model, { id: input.modelId });
    if (!model) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Model ${input.modelId} not found` });
    }

    if (model.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Model ${input.modelId} not accessible` });
    }

    const modelVersionExist = await orm.em.findOne(ModelVersion,
      { versionName: input.versionName, model });
    if (modelVersionExist) throw new TRPCError({ code: "CONFLICT", message: "ModelVersionExist already exist" });

    // 检查目录是否存在
    const host = getClusterLoginNode(model.clusterId);

    if (!host) { throw clusterNotFound(model.clusterId); }

    await sshConnect(host, user.identityId, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();

      if (!(await sftpExists(sftp, input.path))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `${input.path} does not exists` });
      }
    });

    const modelVersion = new ModelVersion({ ...input, privatePath: input.path, model: model });
    await orm.em.persistAndFlush(modelVersion);
    return { id: modelVersion.id };
  });

export const updateModelVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/model/{modelId}/versions/{versionId}",
      tags: ["modelVersion"],
      summary: "update a modelVersion",
    },
  })
  .input(z.object({
    versionId: z.number(),
    versionName: z.string(),
    versionDescription: z.string().optional(),
    algorithmVersion: z.string().optional(),
    modelId: z.number(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const { versionId, versionName, versionDescription, algorithmVersion, modelId } = input;

    const model = await orm.em.findOne(Model, { id: modelId });
    if (!model) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Model ${modelId} not found` });
    }

    if (model.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Model ${modelId} not accessible` });
    }

    const modelVersion = await orm.em.findOne(ModelVersion, { id: versionId });
    if (!modelVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModelVersion ${versionId} not found` });

    const modelVersionExist = await orm.em.findOne(ModelVersion, { versionName });
    if (modelVersionExist && modelVersionExist !== modelVersion) {
      throw new TRPCError({ code: "CONFLICT", message: "ModelVersion alreay exist" });
    }

    if (modelVersion.sharedStatus === SharedStatus.SHARING ||
      modelVersion.sharedStatus === SharedStatus.UNSHARING) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `Unfinished processing of modelVersion ${versionId} exists`,
      });
    }

    const needUpdateSharedPath = modelVersion.sharedStatus === SharedStatus.SHARED
    && versionName !== modelVersion.versionName;

    // 更新已分享目录下的版本路径名称
    if (needUpdateSharedPath) {
      // 获取更新后的已分享版本路径
      const newVersionSharedPath = await getUpdatedSharedPath({
        clusterId: model.clusterId,
        newName: versionName,
        oldPath: dirname(modelVersion.path),
      });

      const baseFolderName = basename(modelVersion.path);
      const newPath = join(newVersionSharedPath, baseFolderName);
      modelVersion.path = newPath;
    }

    modelVersion.versionName = versionName;
    modelVersion.versionDescription = versionDescription;
    modelVersion.algorithmVersion = algorithmVersion,

    await orm.em.flush();
    return { id: modelVersion.id };
  });

export const deleteModelVersion = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/models/{modelId}/versions/{versionId}",
      tags: ["modelVersion"],
      summary: "delete a new modelVersion",
    },
  })
  .input(z.object({
    versionId: z.number(),
    modelId: z.number(),
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const modelVersion = await orm.em.findOne(ModelVersion, { id: input.versionId });

    if (!modelVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModelVersion ${input.versionId} not found` });

    const model = await orm.em.findOne(Model, { id: input.modelId },
      { populate: ["versions", "versions.sharedStatus"]});
    if (!model) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Model ${input.modelId} not found` });
    }

    if (model.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Model ${input.modelId} not accessible` });
    }

    // 正在分享中或取消分享中的版本，不可删除
    if (modelVersion.sharedStatus === SharedStatus.SHARING
      || modelVersion.sharedStatus === SharedStatus.UNSHARING) {
      throw new TRPCError(
        { code: "PRECONDITION_FAILED",
          message: `ModelVersion (id:${input.versionId}) is currently being shared or unshared` });
    }

    // 如果是已分享的模型版本，则删除分享
    if (modelVersion.sharedStatus === SharedStatus.SHARED) {

      try {
        const host = getClusterLoginNode(model.clusterId);
        if (!host) { throw clusterNotFound(model.clusterId); }

        await sshConnect(host, user.identityId, logger, async (ssh) => {
          await checkSharePermission({
            ssh,
            logger,
            sourcePath: modelVersion.privatePath,
            userId: user.identityId,
          });
        });

        const pathToUnshare
        = model.versions.filter((v) => (v.id !== input.versionId && v.sharedStatus === SharedStatus.SHARED))
          .length > 0 ?
          // 除了此版本以外仍有其他已分享的版本则取消分享当前版本
          dirname(modelVersion.path)
          // 除了此版本以外没有其他已分享的版本则取消分享整个模型
          : dirname(dirname(modelVersion.path));
        await unShareFileOrDir({
          host,
          sharedPath: pathToUnshare,
        });
      } catch (e) {
        logger.error(`ssh failure occured when unshare modelVersion ${input.versionId} of model ${input.modelId}`, e);
      }

      model.isShared = model.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 1
        ? true : false;
      orm.em.persist(model);
    }

    orm.em.remove(modelVersion);
    await orm.em.flush();
    return { success: true };
  });


export const shareModelVersion = procedure
  .meta({
    openapi: {
      // POST /models/{modelId}/versions/{versionId}/share
      // 和其他的类似的API统一
      method: "PUT",
      path: "/modelVersion/share/{versionId}",
      tags: ["modelVersion"],
      summary: "share a modelVersion",
    },
  })
  .input(z.object({
    modelId: z.number(),
    versionId: z.number(),
    sourceFilePath: z.string(),
  }))
  .output(z.void())
  .mutation(async ({ input:{ modelId, versionId, sourceFilePath }, ctx: { user } }) => {
    const orm = await getORM();
    const modelVersion = await orm.em.findOne(ModelVersion, { id: versionId });
    if (!modelVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModelVersion ${modelId} not found` });

    if (modelVersion.sharedStatus === SharedStatus.SHARED)
      throw new TRPCError({ code: "CONFLICT", message: "ModelVersion is already shared" });

    const model = await orm.em.findOne(Model, { id: modelId });
    if (!model)
      throw new TRPCError({ code: "NOT_FOUND", message: `Model ${modelId} not found` });

    if (model.owner !== user.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Model ${modelId}  not accessible` });


    const host = getClusterLoginNode(model.clusterId);
    if (!host) { throw clusterNotFound(model.clusterId); }

    const homeTopDir = await sshConnect(host, user.identityId, logger, async (ssh) => {
      // 确认是否具有分享权限
      await checkSharePermission({ ssh, logger, sourcePath: sourceFilePath, userId: user.identityId });
      // 获取分享路径的上级路径
      const userHomeDir = await getUserHomedir(ssh, user.identityId, logger);
      return dirname(dirname(userHomeDir));
    });

    modelVersion.sharedStatus = SharedStatus.SHARING;
    orm.em.persist([modelVersion]);
    await orm.em.flush();

    const successCallback = async (targetFullPath: string) => {
      const versionPath = join(targetFullPath, path.basename(sourceFilePath));
      modelVersion.sharedStatus = SharedStatus.SHARED;
      modelVersion.path = versionPath;
      if (!model.isShared) { model.isShared = true; };
      await orm.em.persistAndFlush([modelVersion, model]);
    };

    const failureCallback = async () => {
      modelVersion.sharedStatus = SharedStatus.UNSHARED;
      await orm.em.persistAndFlush([modelVersion]);
    };

    shareFileOrDir({
      clusterId: model.clusterId,
      sourceFilePath,
      userId: user.identityId,
      sharedTarget: SHARED_TARGET.MODEL,
      targetName: model.name,
      targetSubName: modelVersion.versionName,
      homeTopDir,
    }, successCallback, failureCallback);

    return;
  });

export const unShareModelVersion = procedure
  .meta({
    openapi: {
      // DELETE /models/{modelId}/versions/{versionId}/share
      // 和其他的类似的API统一
      method: "PUT",
      path: "/modelVersion/unShare/{versionId}",
      tags: ["modelVersion"],
      summary: "unshare a modelVersion",
    },
  })
  .input(z.object({
    versionId: z.number(),
    modelId: z.number(),
  }))
  .output(z.void())
  .mutation(async ({ input:{ versionId, modelId }, ctx: { user } }) => {
    const orm = await getORM();
    const modelVersion = await orm.em.findOne(ModelVersion, { id: versionId });
    if (!modelVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModelVersion ${versionId} not found` });

    if (modelVersion.sharedStatus === SharedStatus.UNSHARED)
      throw new TRPCError({ code: "CONFLICT", message: "ModelVersion is already unShared" });

    const model = await orm.em.findOne(Model, { id: modelId }, {
      populate: ["versions", "versions.sharedStatus"],
    });
    if (!model)
      throw new TRPCError({ code: "NOT_FOUND", message: `Model ${modelId} not found` });

    if (model.owner !== user.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Model ${modelId} not accessible` });

    const host = getClusterLoginNode(model.clusterId);
    if (!host) { throw clusterNotFound(model.clusterId); }

    await sshConnect(host, user.identityId, logger, async (ssh) => {
      await checkSharePermission({
        ssh,
        logger,
        sourcePath: modelVersion.privatePath,
        userId: user.identityId,
      });
    });

    modelVersion.sharedStatus = SharedStatus.UNSHARING;
    orm.em.persist([modelVersion]);
    await orm.em.flush();

    const successCallback = async () => {
      modelVersion.sharedStatus = SharedStatus.UNSHARED;
      modelVersion.path = modelVersion.privatePath;
      model.isShared = model.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 0
        ? true : false;
      await orm.em.persistAndFlush([modelVersion, model]);
    };

    const failureCallback = async () => {
      modelVersion.sharedStatus = SharedStatus.SHARED;
      await orm.em.persistAndFlush([modelVersion]);
    };

    unShareFileOrDir({
      host,
      sharedPath: model.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 0 ?
        // 如果还有其他的已分享版本则只取消此版本的分享
        dirname(modelVersion.path)
        // 如果没有其他的已分享版本则取消整个算法的分享
        : dirname(dirname(modelVersion.path)),
    }, successCallback, failureCallback);

    return;
  });

export const copyPublicModelVersion = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/model/{modelId}/versions/{versionId}/copy",
      tags: ["modelVersion"],
      summary: "copy a public model version",
    },
  })
  .input(z.object({
    modelId: z.number(),
    modelVersionId: z.number(),
    modelName: z.string(),
    versionName: z.string(),
    versionDescription: z.string(),
    path: z.string(),
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    // 1. 检查模型版本是否为公开版本
    const modelVersion = await orm.em.findOne(ModelVersion,
      { id: input.modelVersionId, sharedStatus: SharedStatus.SHARED },
      { populate: ["model"]});

    if (!modelVersion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Model Version ${input.modelVersionId} does not exist or is not public`,
      });
    }
    // 2. 检查该用户是否已有同名模型
    const model = await orm.em.findOne(Model, { name: input.modelName, owner: user.identityId });
    if (model) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `A model with the same name as ${input.modelName} already exists`,
      });
    }

    // 3. 检查用户是否能将源模型拷贝至目标目录
    const host = getClusterLoginNode(modelVersion.model.$.clusterId);

    if (!host) { throw clusterNotFound(modelVersion.model.$.clusterId); }

    await checkCopyFile({ host, userIdentityId: user.identityId,
      toPath: input.path, fileName: path.basename(modelVersion.path) });

    // 3. 写入数据
    const newModel = new Model({
      name: input.modelName,
      owner: user.identityId,
      algorithmFramework: modelVersion.model.$.algorithmFramework,
      algorithmName: modelVersion.model.$.algorithmName,
      description: modelVersion.model.$.description,
      clusterId: modelVersion.model.$.clusterId,
    });

    const newModelVersion = new ModelVersion({
      versionName: input.versionName,
      versionDescription: input.versionDescription,
      path: input.path,
      privatePath: input.path,
      model: newModel,
    });

    try {
      await copyFile({ host, userIdentityId: user.identityId,
        fromPath: modelVersion.path, toPath: input.path });
      // 递归修改文件权限和拥有者
      await chmod({ host, userIdentityId: "root", permission: "750", path: input.path });
      await orm.em.persistAndFlush([newModel, newModelVersion]);
    } catch (err) {
      console.log(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Copy Error",
      });
    }

    return { success: true };
  });
