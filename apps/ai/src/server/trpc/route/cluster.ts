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
import { getUserInfo } from "src/server/auth/server";
import { router } from "src/server/trpc/def";
import { authProcedure } from "src/server/trpc/procedure/base";
import { z } from "zod";

import { getCurrentClusters } from "../../utils/clusters";

export const resource = router({

  // 获取资源管理系统中已授权的 集群ID 列表
  getCurrentUserAssignedClusters: authProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/resource/currentClusterIds",
        tags: ["currentClusterIds"],
        summary: "获取用户信息及token",
      },
    })
    .input(z.void())
    .output(z.object({
      clusterIds: z.array(z.string()),
    }))
    .query(async ({ ctx: { req, res } }) => {

      const userInfo = await getUserInfo(req, res);
      if (!userInfo) {
        throw new TRPCError({
          message: "User is UNAUTHORIZED",
          code: "UNAUTHORIZED",
        });
      }
      const results = await getCurrentClusters(userInfo.identityId);

      return { clusterIds: results };
    }),


});
