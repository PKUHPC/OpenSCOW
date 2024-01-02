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
import { Modal } from "src/server/entities/Modal";
import { ModalVersion } from "src/server/entities/ModalVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { getORM } from "src/server/utils/getOrm";
import { z } from "zod";

export const ModalListSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.union([z.string(), z.undefined()]),
  algorithmName: z.string().optional(),
  algorithmFramework: z.string().optional(),
  isShared: z.boolean(),
  versionsCount: z.number(),
  owner: z.string(),
  clusterId: z.string(),
  createTime: z.string(),
});

export const list = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/modals",
      tags: ["modal"],
      summary: "list modals",
    },
  })
  .input(z.object({
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
    nameOrDesc: z.string().optional(),
    isShared: z.boolean().optional(),
    clusterId: z.string().optional(),
  }))
  .output(z.object({ items: z.array(ModalListSchema), count: z.number() }))
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

    const clusterQuery = input.clusterId ? {
      clusterId: input.clusterId,
    } : {};

    const [items, count] = await orm.em.findAndCount(Modal, {
      ...isPublicQuery,
      ...nameOrDescQuery,
      ...clusterQuery,
    }, {
      limit: input.pageSize || undefined,
      offset: input.page && input.pageSize ? ((input.page ?? 1) - 1) * input.pageSize : undefined,
      populate: ["versions"],
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
        versionsCount: x.versions.count(),
        owner: x.owner,
        clusterId: x.clusterId,
        createTime: x.createTime ? x.createTime.toISOString() : "",
      }; }), count };
  });

export const createModal = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/modals",
      tags: ["modal"],
      summary: "Create a new modal",
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
    const modalExist = await orm.em.findOne(Modal, { name:input.name, owner: user!.identityId });
    if (modalExist) {
      throw new TRPCError({
        code: "CONFLICT",
      });
    }
    // TODO: 判断集群是否可以连接？

    const modal = new Modal({ ...input, owner: user!.identityId, isShared: false });
    await orm.em.persistAndFlush(modal);
    return modal.id;
  });

export const updateModal = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/modals/{id}",
      tags: ["modal"],
      summary: "update a modal",
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
    const modal = await orm.em.findOne(Modal, { id: input.id });

    const modalExist = await orm.em.findOne(Modal, { name:input.name });
    if (modalExist !== modal) {
      throw new TRPCError({
        code: "CONFLICT",
      });
    }

    if (!modal) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${input.id} not found` });
    }

    if (modal.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${input.id} not accessible` });
    }

    if (!modal) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Dataset ${input.id} not found`,
      });
    };

    // TODO: 判断集群是否可以连接？
    modal.name = input.name;
    modal.algorithmName = input.algorithmName;
    modal.algorithmFramework = input.algorithmFramework;
    modal.description = input.description;

    await orm.em.flush();
    return modal.id;
  });

export const deleteModal = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/modals/{id}",
      tags: ["modal"],
      summary: "delete a modal",
    },
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const modal = await orm.em.findOne(Modal, { id: input.id });

    if (!modal) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Modal ${input.id} not found` });
    }

    if (modal.owner !== user!.identityId) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Modal ${input.id} not accessible` });
    }
    const modalVersions = await orm.em.find(ModalVersion, { modal });
    try {
      await orm.em.removeAndFlush([...modalVersions, modal]);
      return { success: true };
    } catch (error) {
      // rollback
      console.error("Error deleting dataset:", error);
      return { success: false };
    }
  });

