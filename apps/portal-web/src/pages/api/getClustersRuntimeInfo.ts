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
import { ClusterRuntimeInfoSchema } from "@scow/config/build/type";
import { libGetClustersRuntimeInfo } from "@scow/lib-web/build/server/clustersActivation";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { validateToken } from "src/auth/token";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export const GetClustersRuntimeInfoSchema = typeboxRouteSchema({

  method: "GET",

  // only set the query value when firstly used in getInitialProps
  query: Type.Object({
    token: Type.Optional(Type.String()),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(ClusterRuntimeInfoSchema),
    }),
  },
});

const auth = authenticate(() => true);
export default route(GetClustersRuntimeInfoSchema,
  async (req, res) => {
    const { token } = req.query;
    // when firstly used in getInitialProps, check the token
    // when logged in, use auth()
    const info = token ? await validateToken(token) : await auth(req, res);
    if (!info) { return; }

    const reply = await libGetClustersRuntimeInfo(publicConfig.MIS_SERVER_URL, runtimeConfig.SCOW_API_AUTH_TOKEN);
    return {
      200: {
        results: reply,
      },
    };
  });
