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
import { Image, Source } from "src/server/entities/Image";
import { procedure } from "src/server/trpc/procedure/base";
import { getORM } from "src/server/utils/getOrm";
import { z } from "zod";

export const list = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/image/list",
      tags: ["image"],
      summary: "Read all images",
    },
  })
  .input(z.object({
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
    nameOrTagOrDesc: z.string().optional(),
    isShared: z.boolean().optional(),
    clusterId: z.string().optional(),
  }))
  .output(z.object({ items: z.array(z.any()), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const isPublicQuery = input.isShared ? {
      isShared: true,
      owner: { $ne: null },
    } : { owner: user?.identityId };

    const nameOrTagOrDescQuery = input.nameOrTagOrDesc ? {
      $or: [
        { name: { $like: `%${input.nameOrTagOrDesc}%` } },
        { tags: { $like: `%${input.nameOrTagOrDesc}%` } },
        { description: { $like: `%${input.nameOrTagOrDesc}%` } },
      ],
    } : {};

    const [items, count] = await orm.em.findAndCount(Image, {
      $and: [
        nameOrTagOrDescQuery,
        isPublicQuery,
        { clusterId: input.clusterId },
      ],
    }, {
      limit: input.pageSize || undefined,
      offset: input.page && input.pageSize ? ((input.page ?? 1) - 1) * input.pageSize : undefined,
      orderBy: { createTime: "desc" },
    });

    return { items, count };
  });

export const createImage = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/image/create",
      tags: ["image"],
      summary: "Create a new image",
    },
  })
  .input(z.object({
    name: z.string(),
    tags: z.string(),
    description: z.string().optional(),
    source: z.enum([Source.INTERNAL, Source.EXTERNAL]),
    path: z.string(),
    clusterId: z.string(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    // TODO 集群判断
    const imageNameExist = await orm.em.findOne(Image, { name:input.name });
    if (imageNameExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Image's name ${input.name} already exist`,
      });
    };

    const image = new Image({ ...input, owner: user!.identityId });
    await orm.em.persistAndFlush(image);
    return image.id;
  });


export const updateImage = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/image/update/{id}",
      tags: ["image"],
      summary: "update a image",
    },
  })
  .input(z.object({
    id: z.number(),
    tags: z.string(),
    description: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input }) => {
    const orm = await getORM();
    const image = await orm.em.findOne(Image, { id: input.id });
    if (!image) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Image ${input.id} not found`,
      });
    };

    image.tags = input.tags;
    image.description = input.description;

    await orm.em.flush();
    return image.id;
  });

export const deleteImage = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/image/delete/{id}",
      tags: ["image"],
      summary: "delete a image",
    },
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ input }) => {
    const orm = await getORM();
    const image = await orm.em.findOne(Image, { id: input.id });

    if (!image) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Image ${input.id} not found`,
      });
    }
    await orm.em.removeAndFlush(image);
    return { success: true };
  });
