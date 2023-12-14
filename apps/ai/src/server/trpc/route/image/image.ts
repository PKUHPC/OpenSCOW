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

import { Image, Source } from "src/server/entities/Image";
import { getORM } from "src/server/lib/db/orm";
import { procedure } from "src/server/trpc/procedure/base";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(0).optional(),
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
    owner: z.string().optional(),
    name: z.string().optional(),
    tags: z.string().optional(),
    description: z.string().optional(),
  }))
  .output(z.object({ items: z.array(z.any()), count: z.number() }))
  .query(async ({ input }) => {
    const orm = await getORM();
    const [items, count] = await orm.em.findAndCount(Image, {
      owner: input.owner || undefined,
      name: input.name || undefined,
      tags: input.tags || undefined,
      description: input.description || undefined,
    }, {
      limit: input.page || 10, // Default limit
      offset: input.pageSize || 0, // Default offset
      orderBy: { createTime: "desc" },
    });

    return { items, count };
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
    updates: z.object({
      name: z.string(),
      tags: z.string(),
      description: z.string(),
    }),
  }))
  .output(z.number())
  .mutation(async ({ input }) => {
    const orm = await getORM();
    const image = await orm.em.findOne(Image, { id: input.id });
    if (!image) throw new Error("Image not found");
    if (input.updates) {
      Object.assign(image, input.updates);
    }
    await orm.em.persistAndFlush(image);
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
    if (!image) throw new Error("Image not found");
    await orm.em.removeAndFlush(image);
    return { success: true };
  });

export const createImage = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/image/create",
      tags: ["image"],
      summary: "Create a new iamge",
    },
  })
  .input(z.object({
    name: z.string(),
    owner: z.string(),
    tags: z.string(),
    description: z.string(),
    source: z.enum([Source.INTERNAL, Source.EXTERNAL]),
    path: z.string(),
  }))
  .output(z.number())
  .mutation(async ({ input }) => {
    const orm = await getORM();
    const image = new Image(input);
    await orm.em.persistAndFlush(image);
    return image.id;
  });
