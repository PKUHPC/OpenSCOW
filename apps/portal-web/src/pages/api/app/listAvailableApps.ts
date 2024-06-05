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
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { AppServiceClient } from "@scow/protos/build/portal/app";
import { Static, Type } from "@sinclair/typebox";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

// Cannot use App from protos
export const App = Type.Object({
  id: Type.String(),
  name: Type.String(),
  logoPath: Type.Optional(Type.String()),
});
export type App = Static<typeof App>;

export const ListAvailableAppsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
  }),

  responses: {
    200: Type.Object({
      // 公共配置config/apps
      // 与集群配置下config/clusters/[clusterId]/apps下的交互式应用
      // 如果app.id重复，则按照集群配置下读取
      apps: Type.Array(App),
    }),

    403: Type.Null(),
  },
});

// This API is called from server
// API call from server doesn't contain any cookie
// So the API cannot use authenticate way
//
// it's limitation from next-typed-api-routes
// Will be resolved after migrating to trpc
//
// For now, the API requires token from query
// and authenticate manually
export default /* #__PURE__*/route(ListAvailableAppsSchema, async (req) => {

  const { cluster } = req.query;

  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "listAvailableApps", { cluster }).then((reply) => {
    return { 200: { apps: reply.apps } };
  });

});
