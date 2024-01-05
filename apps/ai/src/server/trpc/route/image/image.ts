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

import { getSortedClusterIds } from "@scow/config/build/cluster";
import { loggedExec, sshConnect as libConnect } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { aiConfig } from "src/server/config/ai";
import { config, rootKeyPair } from "src/server/config/env";
import { Image, Source } from "src/server/entities/Image";
import { procedure } from "src/server/trpc/procedure/base";
import { clusterNotFound } from "src/server/utils/errors";
import { getORM } from "src/server/utils/getOrm";
import { getHarborImageName, loadedImageRegex } from "src/server/utils/image";
import { logger } from "src/server/utils/logger";
import { loginToHarbor } from "src/server/utils/loginHarbor";
import { checkSharePermission } from "src/server/utils/share";
import { getClusterLoginNode } from "src/server/utils/ssh";
import { z } from "zod";

import { clusters } from "../config";

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
        input.clusterId ? { clusterId: input.clusterId } : {},
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
  .output(z.void())
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    const { name, tag, source, sourcePath } = input;
    const imageNameTagExist = await orm.em.findOne(Image,
      { name, tag, owner: user.identityId });
    if (imageNameTagExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Image's name ${name} with tag ${tag} already exist`,
      });
    };

    const NotTarError = new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message: `Image ${name}:${tag} create failed: image is not a tar file`,
    });

    const NoClusterError = new TRPCError({
      code: "NOT_FOUND",
      message: `Image ${name}:${tag} create failed: there is no available cluster`,
    });

    const NoLocalImageError = new TRPCError({
      code: "NOT_FOUND",
      message: `Image ${name}:${tag} create failed: localImage not found`,
    });

    // 获取加载镜像的集群节点，如果是远程镜像则使用列表第一个集群作为本地处理镜像的节点
    const processClusterId = input.source === Source.INTERNAL ? input.clusterId : getSortedClusterIds(clusters)[0];

    const targetImage = getHarborImageName({
      url: aiConfig.harborConfig.url,
      project: aiConfig.harborConfig.project,
      userId: user.identityId,
      imageName: name,
      imageTag: tag,
    });

    if (!processClusterId) { throw NoClusterError; }

    const host = getClusterLoginNode(processClusterId);
    if (!host) { throw clusterNotFound(processClusterId); };

    // 本地镜像检查源文件拥有者权限
    if (input.source === Source.INTERNAL) {
      // 判断文件权限
      await checkSharePermission({
        clusterId: processClusterId,
        checkedSourcePath: sourcePath,
        user: user,
      });
    }

    let localImage: string | undefined = undefined;
    await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {

      // 本地镜像时docker加载镜像
      if (source === Source.INTERNAL) {
        if (sourcePath.endsWith(".tar")) {
          // 加载tar文件镜像
          const dockerLoadCmd = `docker load -i ${sourcePath}`;
          const loadedResp = await loggedExec(ssh, logger, true, dockerLoadCmd, []);
          const match = loadedResp.stdout.match(loadedImageRegex);

          if (match && match.length > 1) {
            localImage = match[1];
          };
        } else {
          throw NotTarError;
        }
        // 远程镜像需先拉取到本地
      } else {

        const dockerPullCmd = `docker pull ${sourcePath}`;
        const pulledResp = await loggedExec(ssh, logger, true, dockerPullCmd, []);
        if (pulledResp) {
          localImage = sourcePath;
        }

      };

      if (localImage === undefined) { throw NoLocalImageError; }

      const dockerTagCmd = `docker tag ${localImage} ${targetImage}`;
      await loggedExec(ssh, logger, true, dockerTagCmd, []);

      const loginHarborCmd =
            `docker login ${aiConfig.harborConfig.url} -u ${aiConfig.harborConfig.user} \
            -p ${aiConfig.harborConfig.password}`;
      await loggedExec(ssh, logger, true, loginHarborCmd, []);

      const dockerPushCmd = `docker push ${targetImage}`;
      await loggedExec(ssh, logger, true, dockerPushCmd, []).then(async () => {

        // 删除本地镜像
        const dockerRmiCmd = `docker rmi ${localImage}`;
        try {
          loggedExec(ssh, logger, false, dockerRmiCmd, []);
        } catch (e) {
          logger.error(`${localImage} rmi failed`, e);
        };

        // 更新数据库
        const image = new Image({ ...input, path: targetImage, owner: user!.identityId });
        await orm.em.persistAndFlush(image);
        return image.id;
      });


    });

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



    // 获取harrbor中的reference以删除镜像
    const getReferenceUrl = `${ config.PROTOCOL || "http"}://${aiConfig.harborConfig.url}/api/v2.0/projects`
    + `/${aiConfig.harborConfig.project}/repositories/${user.identityId}/${image.name}/artifacts`;
    const getReferenceRes = await fetch(getReferenceUrl, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        // "X-Harbor-CSRF-Token": csrfToken,
      },
    });

    if (!getReferenceRes.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get image reference: " + getReferenceRes.statusText,
      });
    }

    // 登录harbor获取token
    const csrfToken = await loginToHarbor();

    if (!csrfToken) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Login to harbor failed! Please contact the administrator! ",
      });
    }

    const referenceRes = await getReferenceRes.json();

    console.log("reference:", referenceRes);

    let reference = "";
    for (const item of referenceRes) {
      if (item.tag.find((i: { name: string }) => i.name === image.tag)) {
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
    + `/${aiConfig.harborConfig.project}/repositories/${user.identityId}/${image.name}`
    + `/artifacts/${reference}/tags/${image.tag}`;
    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        "X-Harbor-CSRF-Token": csrfToken,
      },
    });

    if (!deleteRes.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete image tag: " + deleteRes.statusText,
      });
    }

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
  .output(z.void())
  .mutation(async ({ input, ctx: { user } }) => {

    const orm = await getORM();

    const { copiedId, newName, newTag } = input;

    const sharedImage = await orm.em.findOne(Image, { id: copiedId, isShared: true });

    if (!sharedImage) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Shared Image ${copiedId} not found`,
      });
    };

    const imageNameTagsExist = await orm.em.findOne(Image,
      { name: newName, tag: newTag, owner: user.identityId });
    if (imageNameTagsExist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Image's name ${newName} with tag ${newTag} already exist`,
      });
    };

    const NoClusterError = new TRPCError({
      code: "NOT_FOUND",
      message: `Image ${newName}:${newTag} create failed: there is no available cluster`,
    });

    const NoLocalImageError = new TRPCError({
      code: "NOT_FOUND",
      message: `Image ${newName}:${newTag} create failed: localImage not found`,
    });

    const processClusterId = getSortedClusterIds(clusters)[0];
    if (!processClusterId) { throw NoClusterError; }

    const host = getClusterLoginNode(processClusterId);
    if (!host) { throw clusterNotFound(processClusterId); };

    await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
      // 拉取远程镜像
      const dockerPullCmd = `docker pull ${sharedImage.path}`;
      const pulledResp = await loggedExec(ssh, logger, true, dockerPullCmd, []);

      const localImage = pulledResp ? sharedImage.path : undefined;
      if (!localImage) { throw NoLocalImageError; }

      const targetImage = getHarborImageName({
        url: aiConfig.harborConfig.url,
        project: aiConfig.harborConfig.project,
        userId: user.identityId,
        imageName: newName,
        imageTag: newTag,
      });

      // 制作镜像上传
      const dockerTagCmd = `docker tag ${localImage} ${targetImage}`;
      await loggedExec(ssh, logger, true, dockerTagCmd, []);

      const loginHarborCmd =
            `docker login ${aiConfig.harborConfig.url} -u ${aiConfig.harborConfig.user} \
            -p ${aiConfig.harborConfig.password}`;
      await loggedExec(ssh, logger, true, loginHarborCmd, []);

      const dockerPushCmd = `docker push ${targetImage}`;
      await loggedExec(ssh, logger, true, dockerPushCmd, []).then(async () => {

        // 删除本地镜像
        const dockerRmiCmd = `docker rmi ${localImage}`;
        try {
          loggedExec(ssh, logger, false, dockerRmiCmd, []);
        } catch (e) {
          logger.error(`${localImage} rmi failed`, e);
        };

        const image = new Image({
          name: input.newName,
          tag: input.newTag,
          owner: user.identityId,
          source: Source.EXTERNAL,
          sourcePath: sharedImage.path,
          path: targetImage,
          description: sharedImage.description,
        });
        await orm.em.persistAndFlush(image);

        return image.id;

      });
    });
  });
