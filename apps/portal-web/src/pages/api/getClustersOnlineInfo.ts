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
import { libGetClustersOnlineInfo } from "@scow/lib-web/build/server/misCommon";
import { Type } from "@sinclair/typebox";
import { ClusterOnlineInfoSchema } from "src/models/cluster";
import { runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export const GetClustersOnlineInfoSchema = typeboxRouteSchema({

  method: "GET",

  responses: {
    200: Type.Object({
      results: Type.Array(ClusterOnlineInfoSchema),
    }),

  },
});

export default route(GetClustersOnlineInfoSchema,
  async () => {

    // const reply = await libGetClustersOnlineInfo(runtimeConfig.MIS_SERVER_URL, runtimeConfig.SCOW_API_AUTH_TOKEN);
    const reply = await libGetClustersOnlineInfo("localhost:5004", runtimeConfig.SCOW_API_AUTH_TOKEN);
    return {
      200: {
        results: reply,
      },
    };
  });
