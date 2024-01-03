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
import path from "path";
import { Algorithm } from "src/server/entities/Algorithm";
import { AlgorithmVersion, SharedStatus } from "src/server/entities/AlgorithmVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { getORM } from "src/server/utils/getOrm";
import { checkSharePermission, SHARED_DIR, SHARED_TARGET, shareFileOrDir, unShareFileOrDir }
  from "src/server/utils/share";
import { z } from "zod";

const mockAlgorithmVersions = [
  {
    id: 100,
    name: "aaa",
    owner: "demo_admin1",
    isShared: true,
    description: "test1",
    createTime: "2023-04-15 12:30:45",
    path:"",
  },
  {
    id: 101,
    name: "bbb",
    owner: "demo_admin2",
    isShared: false,
    description: "test2",
    createTime: "2023-04-15 12:22:45",
    path:"",
  },
];

export const getAlgorithmVersions = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/algorithmVersions/list/{algorithmId}",
      tags: ["algorithmVersion"],
      summary: "get algorithmVersions",
    },
  })
  .input(z.object({
    algorithmId: z.number(),
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
    isPublic:z.boolean().optional(),
  }))
  .output(z.object({ items: z.array(z.object({
    id:z.number(),
    versionName:z.string(),
    versionDescription:z.string(),
    path:z.string(),
    privatePath: z.string(),
    sharedStatus:z.nativeEnum(SharedStatus),
    createTime:z.string(),
  })), count: z.number() }))
  .query(async ({ input:{ algorithmId, page, pageSize, isPublic } }) => {
    const orm = await getORM();
    const [items, count] = await orm.em.findAndCount(AlgorithmVersion,
      {
        algorithm: algorithmId,
        ...isPublic ? { sharedStatus:SharedStatus.SHARED } : {},
      },
      {
        populate: ["algorithm"],
        ...page ?
          {
            offset: (page - 1) * (pageSize || 10),
            limit: pageSize || 10,
          } : {},
        orderBy: { createTime: "desc" },
      });

    return { items:items.map((x) => {
      return {
        id:x.id,
        versionName:x.versionName,
        versionDescription:x.versionDescription ?? "",
        sharedStatus:x.sharedStatus,
        createTime:x.createTime ? x.createTime.toISOString() : "",
        path:x.path,
        privatePath: x.privatePath,
      };
    }), count };
  });

export const createAlgorithmVersion = procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/algorithmVersion/create",
      tags: ["algorithmVersion"],
      summary: "Create a new algorithmVersion",
    },
  })
  .input(z.object({
    versionName: z.string(),
    path: z.string(),
    versionDescription: z.string().optional(),
    algorithmId: z.number(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const { em } = await getORM();
    const algorithm = await em.findOne(Algorithm, { id: input.algorithmId });
    if (!algorithm) throw new TRPCError({ code: "NOT_FOUND", message: "Algorithm not Found" });

    if (algorithm && algorithm.owner !== user?.identityId)
      throw new TRPCError({ code: "CONFLICT", message: "Algorithm is belonged to the other user" });

    const algorithmVersionExist = await em.findOne(AlgorithmVersion,
      { versionName: input.versionName, algorithm });
    if (algorithmVersionExist) throw new TRPCError({ code: "CONFLICT", message: "AlgorithmVersion already exist" });

    const algorithmVersion = new AlgorithmVersion({ ...input, privatePath: input.path, algorithm: algorithm });
    await em.persistAndFlush(algorithmVersion);
    return { id: algorithmVersion.id };
  });

export const updateAlgorithmVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/algorithmVersion/update/{versionId}",
      tags: ["algorithmVersion"],
      summary: "update a algorithmVersion",
    },
  })
  .input(z.object({
    algorithmId: z.number(),
    versionId: z.number(),
    versionName: z.string(),
    versionDescription: z.string().optional(),
  }))
  .output(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx: { user } }) => {
    const orm = await getORM();

    const algorithm = await orm.em.findOne(Algorithm, { id: input.algorithmId });
    if (!algorithm) throw new Error("Algorithm not found");

    const algorithmVersion = await orm.em.findOne(AlgorithmVersion, { id: input.versionId });
    if (!algorithmVersion) throw new Error("AlgorithmVersion not found");

    const algorithmVersionExist = await orm.em.findOne(AlgorithmVersion, { versionName: input.versionName });
    if (algorithmVersionExist && algorithmVersionExist !== algorithmVersion) {
      throw new TRPCError({ code: "CONFLICT", message: "AlgorithmVersion alreay exist" });
    }

    algorithmVersion.versionName = input.versionName;
    algorithmVersion.versionDescription = input.versionDescription;

    await orm.em.flush();
    return { id: algorithmVersion.id };
  });

export const deleteAlgorithmVersion = procedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/algorithmVersion/delete/{id}",
      tags: ["algorithmVersion"],
      summary: "delete a new algorithmVersion",
    },
  })
  .input(z.object({ id: z.number(), algorithmId:z.number() }))
  .output(z.void())
  .mutation(async ({ input:{ id, algorithmId }, ctx: { user } }) => {
    const orm = await getORM();
    const algorithmVersion = await orm.em.findOne(AlgorithmVersion, { id });
    if (!algorithmVersion) throw new Error(`AlgorithmVersion${id} not found`);

    const algorithm = await orm.em.findOne(Algorithm, { id: algorithmId },
      { populate: ["versions", "versions.sharedStatus"]});
    if (!algorithm)
      throw new TRPCError({ code: "NOT_FOUND", message: `Algorithm ${algorithmId} not found` });

    if (algorithm.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Algorithm ${algorithmId} not accessible` });

    // 如果是已分享的数据集版本，则删除分享
    if (algorithmVersion.sharedStatus === SharedStatus.SHARED) {
      await checkSharePermission({
        clusterId: algorithm.clusterId,
        checkedSourcePath: algorithmVersion.privatePath,
        user,
        checkedTargetPath: algorithmVersion.path,
      });
      await unShareFileOrDir({
        clusterId: algorithm.clusterId,
        sharedPath: algorithmVersion.path,
        user,
      });

      algorithm.isShared = algorithm.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 1
        ? true : false;
      await orm.em.flush();
    }

    orm.em.remove(algorithmVersion);
    await orm.em.flush();
    return;
  });

export const shareAlgorithmVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/algorithmVersion/share/{versionId}",
      tags: ["algorithmVersion"],
      summary: "share a algorithmVersion",
    },
  })
  .input(z.object({
    algorithmId: z.number(),
    versionId: z.number(),
    sourceFilePath: z.string(),
  }))
  .output(z.void())
  .mutation(async ({ input:{ algorithmId, versionId, sourceFilePath }, ctx: { user } }) => {
    const orm = await getORM();
    const algorithmVersion = await orm.em.findOne(AlgorithmVersion, { id: versionId });
    if (!algorithmVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `AlgorithmVersion ${algorithmId} not found` });

    if (algorithmVersion.sharedStatus === SharedStatus.SHARED)
      throw new TRPCError({ code: "CONFLICT", message: "AlgorithmVersion is already shared" });

    const algorithm = await orm.em.findOne(Algorithm, { id: algorithmId });
    if (!algorithm)
      throw new TRPCError({ code: "NOT_FOUND", message: `Algorithm ${algorithmId} not found` });

    if (algorithm.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Algorithm ${algorithmId}  not accessible` });

    await checkSharePermission({
      clusterId: algorithm.clusterId,
      checkedSourcePath: algorithmVersion.privatePath,
      user,
    });

    // 定义分享后目标存储的绝对路径
    const targetName = `${algorithm.name}-${user!.identityId}`;
    const targetSubName = `${algorithmVersion.versionName}`;
    const targetPath = path.join(SHARED_DIR, SHARED_TARGET.ALGORITHM, targetName, targetSubName);

    algorithmVersion.sharedStatus = SharedStatus.SHARING;
    orm.em.persist([algorithmVersion]);
    await orm.em.flush();

    const successCallback = async () => {
      algorithmVersion.sharedStatus = SharedStatus.SHARED;
      algorithmVersion.path = targetPath;
      if (!algorithm.isShared) { algorithm.isShared = true; };
      await orm.em.persistAndFlush([algorithmVersion, algorithm]);
    };

    const failureCallback = async () => {
      algorithmVersion.sharedStatus = SharedStatus.UNSHARED;
      await orm.em.persistAndFlush([algorithmVersion]);
    };

    shareFileOrDir({
      clusterId: algorithm.clusterId,
      sourceFilePath,
      user,
      sharedTarget: SHARED_TARGET.ALGORITHM,
      targetName,
      targetSubName,
    }, successCallback, failureCallback);

    return;
  });

export const unShareAlgorithmVersion = procedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/algorithmVersion/unShare/{versionId}",
      tags: ["algorithmVersion"],
      summary: "unshare a algorithmVersion",
    },
  })
  .input(z.object({
    versionId: z.number(),
    algorithmId: z.number(),
  }))
  .output(z.void())
  .mutation(async ({ input:{ versionId, algorithmId }, ctx: { user } }) => {
    const orm = await getORM();
    const algorithmVersion = await orm.em.findOne(AlgorithmVersion, { id: versionId });
    if (!algorithmVersion)
      throw new TRPCError({ code: "NOT_FOUND", message: `AlgorithmVersion ${versionId} not found` });

    if (algorithmVersion.sharedStatus === SharedStatus.UNSHARED)
      throw new TRPCError({ code: "CONFLICT", message: "AlgorithmVersion is already unShared" });

    const algorithm = await orm.em.findOne(Algorithm, { id: algorithmId }, {
      populate: ["versions", "versions.sharedStatus"],
    });
    if (!algorithm)
      throw new TRPCError({ code: "NOT_FOUND", message: `Algorithm ${algorithmId} not found` });

    if (algorithm.owner !== user?.identityId)
      throw new TRPCError({ code: "FORBIDDEN", message: `Algorithm ${algorithmId} not accessible` });

    await checkSharePermission({
      clusterId: algorithm.clusterId,
      checkedSourcePath: algorithmVersion.privatePath,
      user,
      checkedTargetPath: algorithmVersion.path,
    });

    algorithmVersion.sharedStatus = SharedStatus.UNSHARING;
    orm.em.persist([algorithmVersion]);
    await orm.em.flush();

    const successCallback = async () => {
      algorithmVersion.sharedStatus = SharedStatus.UNSHARED;
      algorithmVersion.path = algorithmVersion.privatePath;
      algorithm.isShared = algorithm.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 0
        ? true : false;
      await orm.em.persistAndFlush([algorithmVersion, algorithm]);
    };

    const failureCallback = async () => {
      algorithmVersion.sharedStatus = SharedStatus.SHARED;
      await orm.em.persistAndFlush([algorithmVersion]);
    };

    unShareFileOrDir({
      clusterId: algorithm.clusterId,
      sharedPath: algorithm.versions.filter((v) => (v.sharedStatus === SharedStatus.SHARED)).length > 0 ?
        algorithmVersion.path : path.dirname(algorithmVersion.path),
      user,
    }, successCallback, failureCallback);

    return;
  });

