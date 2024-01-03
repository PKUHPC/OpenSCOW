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

export const ImageListSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.string(),
  source: z.enum([Source.INTERNAL, Source.EXTERNAL]),
  tag: z.string(),
  description: z.string().optional(),
  path: z.string(),
  sourcePath: z.string(),
  isShared: z.boolean(),
  clusterId: z.string().optional(),
  createTime: z.string(),
});

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
    isPublic: z.boolean().optional(),
    clusterId: z.string().optional(),
  }))
  .output(z.object({ items: z.array(ImageListSchema), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const isPublicQuery = input.isPublic ? {
      isShared: true,
      owner: { $ne: null },
    } : { owner: user?.identityId };

    const nameOrTagOrDescQuery = input.nameOrTagOrDesc ? {
      $or: [
        { name: { $like: `%${input.nameOrTagOrDesc}%` } },
        { tag: { $like: `%${input.nameOrTagOrDesc}%` } },
        { description: { $like: `%${input.nameOrTagOrDesc}%` } },
      ],
    } : {};

    const [items, count] = await orm.em.findAndCount(Image, {
      $and: [
        nameOrTagOrDescQuery,
        isPublicQuery,
        { clusterId: input.clusterId ? input.clusterId : { $ne: null } },
      ],
    }, {
      limit: input.pageSize || undefined,
      offset: input.page && input.pageSize ? ((input.page ?? 1) - 1) * input.pageSize : undefined,
      orderBy: { createTime: "desc" },
    });

    return { items: items.map((x) => {
      return {
        id: x.id,
        name: x.name,
        owner: x.owner,
        source: x.source,
        tag: x.tag,
        description: x.description,
        path: x.path,
        sourcePath: x.sourcePath,
        isShared: Boolean(x.isShared),
        clusterId: x.clusterId,
        createTime: x.createTime ? x.createTime.toISOString() : "",
      }; }), count };
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
    tag: z.string(),
    description: z.string().optional(),
    source: z.enum([Source.INTERNAL, Source.EXTERNAL]),
    sourcePath: z.string(),
    clusterId: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const imageNameTagExist = await orm.em.findOne(Image,
      { name: input.name, tag: input.tag, owner: user.identityId });
    if (imageNameTagExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Image's name ${input.name} with tag ${input.tag} already exist`,
      });
    };

    // TODO 上传镜像
    const imageRealPath = "test-harbor";

    const image = new Image({ ...input, path: imageRealPath, owner: user!.identityId });
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
    name: z.string(),
    tag: z.string(),
    description: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const image = await orm.em.findOne(Image, { id: input.id });
    if (!image) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Image ${input.id} not found`,
      });
    };

    if (image.owner !== user.identityId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Image ${input.id} not accessible`,
      });
    }

    const imageNameTagExist = await orm.em.findOne(Image,
      { name: input.name, tag: input.tag, owner: user.identityId, id: { $ne: input.id } });
    if (imageNameTagExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Image's name ${input.name} with tags ${input.tag} already exist`,
      });
    };

    image.name = input.name;
    image.tag = input.tag;
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
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const image = await orm.em.findOne(Image, { id: input.id });

    if (!image) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Image ${input.id} not found`,
      });
    }

    if (image.owner !== user.identityId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Image ${input.id} not accessible`,
      });
    }

    // TODO: 删除habor镜像
    await orm.em.removeAndFlush(image);
    return { success: true };
  });

export const shareOrUnshareImage = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/image/share/{id}",
      tags: ["image"],
      summary: "share a image",
    },
  })
  .input(z.object({ id: z.number(), share: z.boolean() }))
  .output(z.object({}))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const image = await orm.em.findOne(Image, { id: input.id });

    if (!image) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Image ${input.id} not found`,
      });
    };

    if (image.owner !== user.identityId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Image ${input.id} not accessible`,
      });
    }

    image.isShared = input.share;

    await orm.em.persistAndFlush(image);
    return {};
  });


export const copyImage = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/image/copy/{copiedId}",
      tags: ["image"],
      summary: "copy a image",
    },
  })
  .input(z.object({ copiedId: z.number(), newName: z.string(), newTag: z.string() }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const sharedImage = await orm.em.findOne(Image, { id: input.copiedId, isShared: true });

    if (!sharedImage) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Shared Image ${input.copiedId} not found`,
      });
    };

    const imageNameTagsExist = await orm.em.findOne(Image,
      { name:input.newName, tag: input.newTag, owner: user.identityId });
    if (imageNameTagsExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Image's name ${input.newName} with tag ${input.newTag} already exist`,
      });
    };

    // TODO 拉取分享镜像，上传新的镜像
    const imageRealPath = "test-harbor";

    const image = new Image({
      name: input.newName,
      tag: input.newTag,
      owner: user.identityId,
      source: Source.EXTERNAL,
      sourcePath: sharedImage.path,
      path: imageRealPath,
      description: sharedImage.description,
      clusterId: "",
    });
    await orm.em.persistAndFlush(image);

    return image.id;
  });

