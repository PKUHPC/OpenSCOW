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
import { SharedStatus } from "src/models/common";
import { Modal } from "src/server/entities/Modal";
import { ModalVersion } from "src/server/entities/ModalVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { chmod } from "src/server/utils/chmod";
import { copyFile } from "src/server/utils/copyFile";
import { deleteDir } from "src/server/utils/deleteItem";
import { clusterNotFound } from "src/server/utils/errors";
import { getORM } from "src/server/utils/getOrm";
import { checkSharePermission, SHARED_TARGET, shareFileOrDir, unShareFileOrDir, updateSharedName }
  from "src/server/utils/share";
import { getClusterLoginNode } from "src/server/utils/ssh";
import { z } from "zod";

export const VersionListSchema = z.object({
  id: z.number(),
  modalId: z.number(),
  versionName: z.string(),
  sharedStatus: z.nativeEnum(SharedStatus),
  versionDescription: z.string().optional(),
  algorithmVersion: z.string().optional(),
  path: z.string(),
  privatePath: z.string(),
  createTime: z.string(),
});

export const versionList = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/modals/{modalId}/versions",
      tags: ["modalVersions"],
      summary: "Read all modalVersions",
    },
  })
  .input(z.object({
    modalId: z.number(),
    isShared: z.boolean().optional(),
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
  }))
  .output(z.object({ items: z.array(VersionListSchema), count: z.number() }))
  .query(async ({ input }) => {
    const orm = await getORM();

    const [items, count] = await orm.em.findAndCount(ModalVersion,
      {
        modal: { id: input.modalId },
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
        modalId: x.modal.id,
        versionName: x.versionName,
        versionDescription: x.versionDescription,
        algorithmVersion:x.algorithmVersion,
        path: x.path,
        privatePath: x.privatePath,
        sharedStatus: x.sharedStatus,
        createTime: x.createTime ? x.createTime.toISOString() : "",
      }; }), count };
  });

export const createModalVersion = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/modals/{modalId}/versions",
      tags: ["modalVersion"],
      summary: "Create a new modalVersion",
    },
  })
  .input(z.object({
    versionName: z.string(),
    versionDescription: z.string().optional(),
    algorithmVersion: z.string().optional(),
    path: z.string(),
    modalId: z.number(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const modal = await orm.em.findOne(Modal, { id: input.modalId });
    if (!modal) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${input.modalId} not found` });
    }

    if (modal.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${input.modalId} not accessible` });
    }

    const modalVersionExist = await orm.em.findOne(ModalVersion,
      { versionName: input.versionName, modal });
    if (modalVersionExist) throw new TRPCError({ code: "CONFLICT", message: "ModalVersionExist already exist" });

    const modalVersion = new ModalVersion({ ...input, privatePath: input.path, modal: modal });
    await orm.em.persistAndFlush(modalVersion);
    return { id: modalVersion.id };
  });

export const updateModalVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/modal/{modalId}/versions/{id}",
      tags: ["modalVersion"],
      summary: "update a modalVersion",
    },
  })
  .input(z.object({
    id: z.number(),
    versionName: z.string(),
    versionDescription: z.string().optional(),
    algorithmVersion: z.string().optional(),
    modalId: z.number(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const { id, versionName, versionDescription, algorithmVersion, modalId } = input;

    const modal = await orm.em.findOne(Modal, { id: modalId });
    if (!modal) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${modalId} not found` });
    }

    if (modal.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${modalId} not accessible` });
    }

    const modalVersion = await orm.em.findOne(ModalVersion, { id });
    if (!modalVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModalVersion ${id} not found` });

    const modalVersionExist = await orm.em.findOne(ModalVersion, { versionName });
    if (modalVersionExist && modalVersionExist !== modalVersion) {
      throw new TRPCError({ code: "CONFLICT", message: "ModalVersion alreay exist" });
    }

    const needUpdateSharedPath = modalVersion.sharedStatus === SharedStatus.SHARED
    && versionName !== modalVersion.versionName;
    if (needUpdateSharedPath) {
      await updateSharedName({
        target: SHARED_TARGET.MODAL,
        user: user,
        clusterId: modal.clusterId,
        newName: versionName,
        isVersionName: true,
        oldPath: modalVersion.path,
      });

      const dir = dirname(modalVersion.path);
      const newPath = join(dir, input.versionName);
      modalVersion.path = newPath;
    }

    modalVersion.versionName = versionName;
    modalVersion.versionDescription = versionDescription;
    modalVersion.algorithmVersion = algorithmVersion,

    await orm.em.flush();
    return { id: modalVersion.id };
  });

export const deleteModalVersion = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/modals/{modalId}/versions/{id}",
      tags: ["modalVersion"],
      summary: "delete a new modalVersion",
    },
  })
  .input(z.object({
    id: z.number(),
    modalId: z.number(),
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const modalVersion = await orm.em.findOne(ModalVersion, { id: input.id });

    if (!modalVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModalVersion ${input.id} not found` });

    const modal = await orm.em.findOne(Modal, { id: input.modalId },
      { populate: ["versions", "versions.sharedStatus"]});
    if (!modal) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${input.modalId} not found` });
    }

    if (modal.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${input.modalId} not accessible` });
    }

    // 如果是已分享的数据集版本，则删除分享
    if (modalVersion.sharedStatus === SharedStatus.SHARED) {
      await checkSharePermission({
        clusterId: modal.clusterId,
        checkedSourcePath: modalVersion.privatePath,
        user,
        checkedTargetPath: modalVersion.path,
      });
      await unShareFileOrDir({
        clusterId: modal.clusterId,
        sharedPath: modalVersion.path,
        user,
      });

      modal.isShared = modal.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 1
        ? true : false;
      orm.em.persist(modal);
    }

    orm.em.remove(modalVersion);
    await orm.em.flush();
    return { success: true };
  });


export const shareModalVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/modalVersion/share/{versionId}",
      tags: ["modalVersion"],
      summary: "share a modalVersion",
    },
  })
  .input(z.object({
    modalId: z.number(),
    versionId: z.number(),
    sourceFilePath: z.string(),
  }))
  .output(z.void())
  .mutation(async ({ input:{ modalId, versionId, sourceFilePath }, ctx: { user } }) => {
    const orm = await getORM();
    const modalVersion = await orm.em.findOne(ModalVersion, { id: versionId });
    if (!modalVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModalVersion ${modalId} not found` });

    if (modalVersion.sharedStatus === SharedStatus.SHARED)
      throw new TRPCError({ code: "CONFLICT", message: "ModalVersion is already shared" });

    const modal = await orm.em.findOne(Modal, { id: modalId });
    if (!modal)
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${modalId} not found` });

    if (modal.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${modalId}  not accessible` });

    const homeTopDir = await checkSharePermission({
      clusterId: modal.clusterId,
      checkedSourcePath: modalVersion.privatePath,
      user,
    });

    // 定义分享后目标存储的绝对路径
    const targetName = `${modal.name}-${user!.identityId}`;
    const targetSubName = `${modalVersion.versionName}`;
    // const targetPath = path.join(SHARED_DIR, SHARED_TARGET.MODAL, targetName, targetSubName);

    modalVersion.sharedStatus = SharedStatus.SHARING;
    orm.em.persist([modalVersion]);
    await orm.em.flush();

    const successCallback = async (targetFullPath: string) => {
      modalVersion.sharedStatus = SharedStatus.SHARED;
      modalVersion.path = targetFullPath;
      if (!modal.isShared) { modal.isShared = true; };
      await orm.em.persistAndFlush([modalVersion, modal]);
    };

    const failureCallback = async () => {
      modalVersion.sharedStatus = SharedStatus.UNSHARED;
      await orm.em.persistAndFlush([modalVersion]);
    };

    shareFileOrDir({
      clusterId: modal.clusterId,
      sourceFilePath,
      user,
      sharedTarget: SHARED_TARGET.MODAL,
      targetName,
      targetSubName,
      homeTopDir,
    }, successCallback, failureCallback);

    return;
  });

export const unShareModalVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/modalVersion/unShare/{versionId}",
      tags: ["modalVersion"],
      summary: "unshare a modalVersion",
    },
  })
  .input(z.object({
    versionId: z.number(),
    modalId: z.number(),
  }))
  .output(z.void())
  .mutation(async ({ input:{ versionId, modalId }, ctx: { user } }) => {
    const orm = await getORM();
    const modalVersion = await orm.em.findOne(ModalVersion, { id: versionId });
    if (!modalVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModalVersion ${versionId} not found` });

    if (modalVersion.sharedStatus === SharedStatus.UNSHARED)
      throw new TRPCError({ code: "CONFLICT", message: "ModalVersion is already unShared" });

    const modal = await orm.em.findOne(Modal, { id: modalId }, {
      populate: ["versions", "versions.sharedStatus"],
    });
    if (!modal)
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${modalId} not found` });

    if (modal.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${modalId} not accessible` });

    await checkSharePermission({
      clusterId: modal.clusterId,
      checkedSourcePath: modalVersion.privatePath,
      user,
      checkedTargetPath: modalVersion.path,
    });

    modalVersion.sharedStatus = SharedStatus.UNSHARING;
    orm.em.persist([modalVersion]);
    await orm.em.flush();

    const successCallback = async () => {
      modalVersion.sharedStatus = SharedStatus.UNSHARED;
      modalVersion.path = modalVersion.privatePath;
      modal.isShared = modal.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 0
        ? true : false;
      await orm.em.persistAndFlush([modalVersion, modal]);
    };

    const failureCallback = async () => {
      modalVersion.sharedStatus = SharedStatus.SHARED;
      await orm.em.persistAndFlush([modalVersion]);
    };

    unShareFileOrDir({
      clusterId: modal.clusterId,
      sharedPath: modal.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 0 ?
        modalVersion.path : path.dirname(modalVersion.path),
      user,
    }, successCallback, failureCallback);

    return;
  });

export const copyPublicModalVersion = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/modal/{modalId}/version/{modalVersionId}/copy",
      tags: ["modalVersion"],
      summary: "copy a public modal version",
    },
  })
  .input(z.object({
    modalId: z.number(),
    modalVersionId: z.number(),
    modalName: z.string(),
    versionName: z.string(),
    versionDescription: z.string(),
    path: z.string(),
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    // 1. 检查模型版本是否为公开版本
    const modalVersion = await orm.em.findOne(ModalVersion,
      { id: input.modalVersionId, sharedStatus: SharedStatus.SHARED },
      { populate: ["modal"]});

    if (!modalVersion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Modal Version ${input.modalVersionId} does not exist or is not public`,
      });
    }
    // 2. 检查该用户是否已有同名模型
    const modal = await orm.em.findOne(Modal, { name: input.modalName, owner: user.identityId });
    if (modal) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `A modal with the same name as ${input.modalName} already exists`,
      });
    }

    // 3. 写入数据
    const newModal = new Modal({
      name: input.modalName,
      owner: user.identityId,
      algorithmFramework: modalVersion.modal.$.algorithmFramework,
      algorithmName: modalVersion.modal.$.algorithmName,
      description: modalVersion.modal.$.description,
      clusterId: modalVersion.modal.$.clusterId,
    });

    const newModalVersion = new ModalVersion({
      versionName: input.versionName,
      versionDescription: input.versionDescription,
      path: input.path,
      privatePath: input.path,
      modal: newModal,
    });

    const host = getClusterLoginNode(modalVersion.modal.$.clusterId);

    if (!host) { throw clusterNotFound(modalVersion.modal.$.clusterId); }

    // TODO：判断有无同名文件夹

    try {
      await copyFile({ host, userIdentityId: user.identityId,
        fromPath: modalVersion.path, toPath: input.path });
      // 递归修改文件权限和拥有者
      await chmod({ host, userIdentityId: "root", permission: "750", path: input.path });
      await orm.em.persistAndFlush([newModal, newModalVersion]);
    } catch (err) {
      // 回滚
      await deleteDir({ host, userIdentityId: "root", dirPath: input.path });
      console.log(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Copy Error",
      });
    }

    return { success: true };
  });
