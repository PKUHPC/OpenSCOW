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
import { Modal } from "src/server/entities/Modal";
import { ModalVersion } from "src/server/entities/ModalVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { getORM } from "src/server/utils/getOrm";
import { z } from "zod";

export const VersionListSchema = z.object({
  id: z.number(),
  modalId: z.number(),
  versionName: z.string(),
  isShared: z.boolean(),
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
      { modal: { id: input.modalId }, isShared: input.isShared || { $ne: null } },
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
        isShared: Boolean(x.isShared),
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

    const modalVersion = new ModalVersion({ ...input, privatePath: input.path, modal: modal, isShared: false });
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

    const modal = await orm.em.findOne(Modal, { id: input.modalId });
    if (!modal) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${input.modalId} not found` });
    }

    if (modal.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${input.modalId} not accessible` });
    }

    const modalVersion = await orm.em.findOne(ModalVersion, { id: input.id });
    if (!modalVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModalVersion ${input.id} not found` });

    modalVersion.versionName = input.versionName;
    modalVersion.versionDescription = input.versionDescription;
    modalVersion.algorithmVersion = input.algorithmVersion,

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
    const modal = await orm.em.findOne(Modal, { id: input.modalId });
    if (!modal) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${input.modalId} not found` });
    }

    if (modal.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${input.modalId} not accessible` });
    }

    const modalVersion = await orm.em.findOne(ModalVersion, { id: input.id });

    if (!modalVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `ModalVersion ${input.id} not found` });

    await orm.em.removeAndFlush(modalVersion);
    return { success: true };
  });
