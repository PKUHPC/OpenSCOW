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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { ConfigServiceClient } from "@scow/protos/build/server/config";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Type } from "@sinclair/typebox";
import { ClusterOnlineInfo, ClusterOnlineInfoSchema } from "src/models/cluster";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export const GetClustersOnlineInfoSchema = typeboxRouteSchema({

  method: "GET",

  responses: {
    200: Type.Object({
      results: Type.Array(ClusterOnlineInfoSchema),
      totalCount: Type.Number(),
    }),

  },
});

export default route(GetClustersOnlineInfoSchema,
  async () => {

    const client = getClient(ConfigServiceClient);
    const result = await asyncClientCall(client, "getClustersOnlineInfo", {});

    const operatorIds = Array.from(new Set(result.results.map((x) => x.operatorId)));
    const userIds = operatorIds.filter((id) => typeof id === "string" && id !== undefined && id !== null) as string[];

    const userClient = getClient(UserServiceClient);
    const { users } = await asyncClientCall(userClient, "getUsersByIds", {
      userIds,
    });

    const userMap = new Map(users.map((x) => [x.userId, x.userName]));

    const clustersOnlineInfo: ClusterOnlineInfo[] = result.results.map((x) => {
      return {
        ...x,
        operatorName: x.operatorId ? userMap.get(x.operatorId) : "",
      };
    });

    return {
      200: {
        results: clustersOnlineInfo,
        totalCount: result.totalCount,
      },
    };
  });
