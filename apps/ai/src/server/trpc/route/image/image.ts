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

import { ServiceError } from "@grpc/grpc-js";
import { getSortedClusterIds } from "@scow/config/build/cluster";
import { sshConnect as libConnect } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { aiConfig } from "src/server/config/ai";
import { config, rootKeyPair } from "src/server/config/env";
import { Image, Source } from "src/server/entities/Image";
import { procedure } from "src/server/trpc/procedure/base";
import { clusterNotFound } from "src/server/utils/errors";
import { forkEntityManager } from "src/server/utils/getOrm";
import { createHarborImageUrl, getLoadedImage, getPulledImage, pushImageToHarbor } from "src/server/utils/image";
import { logger } from "src/server/utils/logger";
import { paginationProps } from "src/server/utils/orm";
import { paginationSchema } from "src/server/utils/pagination";
import { checkSharePermission } from "src/server/utils/share";
import { getClusterLoginNode } from "src/server/utils/ssh";
import { z } from "zod";

import { clusters } from "../config";
import { clusterExist } from "../utils";

class NotTarError extends TRPCError {
  constructor(name: string, tag: string) {
    super({
      code: "UNPROCESSABLE_CONTENT",
      message: `Image ${name}:${tag} create failed: image is not a tar file`,
    });
  }
};

class NoClusterError extends TRPCError {
  constructor(name: string, tag: string) {
    super({
      code: "NOT_FOUND",
      message: `Image ${name}:${tag} create failed: there is no available cluster`,
    });
  }
};

class NoLocalImageError extends TRPCError {
  constructor(name: string, tag: string) {
    super({
      code: "NOT_FOUND",
      message: `Image ${name}:${tag} create failed: localImage not found`,
    });
  }
}

class InternalServerError extends TRPCError {
  constructor(errMessage: string, process: "Create" | "Copy") {
    super({
      code: "INTERNAL_SERVER_ERROR",
      message: `${process} image failed, ${errMessage}`,
    });
  }
}

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
  createTime: z.string().optional(),
});

export const list = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/images",
      tags: ["image"],
      summary: "Read all images",
    },
  })
  .input(z.object({
    ...paginationSchema.shape,
    nameOrTagOrDesc: z.string().optional(),
    isPublic: z.boolean().optional(),
    clusterId: z.string().optional(),
    withExternal: z.boolean().optional(),
  }))
  .output(z.object({ items: z.array(ImageListSchema), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {

    const { clusterId, isPublic, nameOrTagOrDesc, withExternal, pageSize, page } = input;
    const em = await forkEntityManager();

    const isPublicQuery = isPublic ? {
      isShared: true,
      owner: { $ne: null },
    } : { owner: user.identityId };

    const nameOrTagOrDescQuery = nameOrTagOrDesc ? {
      $or: [
        { name: { $like: `%${nameOrTagOrDesc}%` } },
        { tag: { $like: `%${nameOrTagOrDesc}%` } },
        { description: { $like: `%${nameOrTagOrDesc}%` } },
      ],
    } : {};

    const [items, count] = await em.findAndCount(Image, {
      $and: [
        nameOrTagOrDescQuery,
        isPublicQuery,
        input.clusterId ? (withExternal ? { $or: [{ clusterId }, { clusterId: { $eq: null } }]} : { clusterId }) : {},
      ],
    }, {
      ...paginationProps(page, pageSize),
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
        createTime: x.createTime ? x.createTime.toISOString() : undefined,
      }; }), count };
  });

export const createImage = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/images",
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

    if (input.clusterId && !clusterExist(input.clusterId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cluster id ${input.clusterId} does not exist.`,
      });
    }
    const em = await forkEntityManager();
    const { name, tag, source, sourcePath } = input;
    const imageNameTagExist = await em.findOne(Image,
      { name, tag, owner: user.identityId });
    if (imageNameTagExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Image's name ${name} with tag ${tag} already exist`,
      });
    };

    // 获取加载镜像的集群节点，如果是远程镜像则使用优先级最高的集群作为本地处理镜像的节点
    const processClusterId = input.source === Source.INTERNAL ? input.clusterId : getSortedClusterIds(clusters)[0];

    const harborImageUrl = createHarborImageUrl(name, tag, user.identityId);

    if (!processClusterId) { throw new NoClusterError(name, tag); }

    const host = getClusterLoginNode(processClusterId);
    if (!host) { throw clusterNotFound(processClusterId); };

    return await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {

      let localImageUrl: string | undefined = undefined;
      if (source === Source.INTERNAL) {
        // 本地镜像检查源文件拥有者权限
        await checkSharePermission({ ssh, logger, sourcePath: sourcePath, userId: user.identityId });
        // 检查是否为tar文件
        if (!sourcePath.endsWith(".tar")) throw new NotTarError(name, tag);
        // 本地镜像时docker加载镜像
        localImageUrl = await getLoadedImage({ ssh, logger, sourcePath }).catch((e) => {
          const ex = e as ServiceError;
          throw new InternalServerError(ex.message, "Create");
        });
      } else {
        // 远程镜像需先拉取到本地
        localImageUrl = await getPulledImage({ ssh, logger, sourcePath }).catch((e) => {
          const ex = e as ServiceError;
          throw new InternalServerError(ex.message, "Create");
        });
      };

      if (localImageUrl === undefined) { throw new NoLocalImageError(name, tag); }

      // 制作镜像，上传至harbor
      await pushImageToHarbor({
        ssh,
        logger,
        localImageUrl,
        harborImageUrl,
      }).catch((e) => {
        const ex = e as ServiceError;
        throw new InternalServerError(ex.message, "Create");
      });

      // 更新数据库
      const image = new Image({ ...input, path: harborImageUrl, owner: user.identityId });
      await em.persistAndFlush(image);

      return image.id;

    });

  });


export const updateImage = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/images/{id}",
      tags: ["image"],
      summary: "update a image",
    },
  })
  .input(z.object({
    id: z.number(),
    description: z.string().optional(),
  }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {
    const em = await forkEntityManager();
    const image = await em.findOne(Image, { id: input.id });
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
    image.description = input.description;

    await em.flush();
    return image.id;
  });

export const deleteImage = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/images/{id}",
      tags: ["image"],
      summary: "delete a image",
    },
  })
  .input(z.object({ id: z.number() }))
  .output(z.void())
  .mutation(async ({ input, ctx: { user } }) => {
    const em = await forkEntityManager();
    const image = await em.findOne(Image, { id: input.id });

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



    // 10.129.227.64/test/admin/image-delete-test:v1
    // 获取harrbor中的reference以删除镜像
    const getReferenceUrl = `${ config.PROTOCOL || "http"}://${aiConfig.harborConfig.url}/api/v2.0/projects`
    + `/${aiConfig.harborConfig.project}/repositories/${user.identityId}%252F${image.name}/artifacts`;
    const getReferenceRes = await fetch(getReferenceUrl, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });

    if (!getReferenceRes.ok) {
      const errorBody = await getReferenceRes.json();
      // 来自harbor的错误信息
      const errorMessage = errorBody.errors.map((i: {message?: string}) => i.message).join();
      logger.error("Failed to get image reference url %s", getReferenceUrl);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get image reference: " + errorMessage,
      });
    }

    const referenceRes = await getReferenceRes.json();


    let reference = "";
    for (const item of referenceRes) {
      if (item.tags.find((i: { name: string }) => i.name === image.tag)) {
        reference = item.digest;
      }
    }

    if (!reference) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to find image tag in harbor ! Please contact the administrator! ",
      });
    }

    const deleteUrl = `${ config.PROTOCOL || "http"}://${aiConfig.harborConfig.url}/api/v2.0/projects`
    + `/${aiConfig.harborConfig.project}/repositories/${user.identityId}%252F${image.name}`
    + `/artifacts/${reference}/tags/${image.tag}`;

    const authInfo = Buffer.from(`${aiConfig.harborConfig.user}:${aiConfig.harborConfig.password}`).toString("base64");

    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authInfo}`,
      },
    });

    if (!deleteRes.ok) {
      const errorBody = await deleteRes.json();
      // 来自harbor的错误信息
      const errorMessage = errorBody.errors.map((i: {message?: string}) => i.message).join();
      logger.error("Failed to delete image tag url %s", deleteUrl);
      console.log("deleteRes", errorBody);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete image tag: " + errorMessage,
      });
    }

    await em.removeAndFlush(image);
    return;
  });

export const shareOrUnshareImage = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/images/{id}/share",
      tags: ["image"],
      summary: "share a image",
    },
  })
  .input(z.object({ id: z.number(), share: z.boolean() }))
  .output(z.void())
  .mutation(async ({ input, ctx: { user } }) => {
    const em = await forkEntityManager();
    const image = await em.findOne(Image, { id: input.id });

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

    await em.persistAndFlush(image);
    return;
  });


export const copyImage = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/images/{id}/copy",
      tags: ["image"],
      summary: "copy a image",
    },
  })
  .input(z.object({ id: z.number(), newName: z.string(), newTag: z.string() }))
  .output(z.number())
  .mutation(async ({ input, ctx: { user } }) => {

    const em = await forkEntityManager();

    const { id, newName, newTag } = input;

    const sharedImage = await em.findOne(Image, { id, isShared: true });

    if (!sharedImage) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Shared Image ${id} not found`,
      });
    };

    const imageNameTagsExist = await em.findOne(Image,
      { name: newName, tag: newTag, owner: user.identityId });
    if (imageNameTagsExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Image's name ${newName} with tag ${newTag} already exist`,
      });
    };

    const processClusterId = getSortedClusterIds(clusters)[0];
    if (!processClusterId) { throw new NoClusterError(newName, newTag); }

    const host = getClusterLoginNode(processClusterId);
    if (!host) { throw clusterNotFound(processClusterId); };

    return await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
      // 拉取远程镜像
      const localImageUrl = await getPulledImage({ ssh, logger, sourcePath: sharedImage.path })
        .catch((e) => {
          const ex = e as ServiceError;
          throw new InternalServerError(ex.message, "Copy");
        });
      if (!localImageUrl) { throw new NoLocalImageError(newName, newTag); }

      const harborImageUrl = createHarborImageUrl(newName, newTag, user.identityId);

      // 制作镜像上传
      await pushImageToHarbor({
        ssh,
        logger,
        localImageUrl,
        harborImageUrl,
      }).catch((e) => {
        const ex = e as ServiceError;
        throw new InternalServerError(ex.message, "Copy");
      });

      const image = new Image({
        name: input.newName,
        tag: input.newTag,
        owner: user.identityId,
        source: Source.EXTERNAL,
        sourcePath: sharedImage.path,
        path: harborImageUrl,
        description: sharedImage.description,
      });
      await em.persistAndFlush(image);

      return image.id;

    });
  });
