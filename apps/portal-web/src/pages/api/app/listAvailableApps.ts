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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { App, AppServiceClient } from "@scow/protos/build/portal/app";
import { validateToken } from "src/auth/token";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface ListAvailableAppsSchema {
  method: "GET";

  query: {
    token: string;
  }

  responses: {
    200: {
      apps: App[];
    };

    403: null;
  }
}

// This API is called from server
// API call from server doesn't contain any cookie
// So the API cannot use authenticate way
//
// it's limitation from next-typed-api-routes
// Will be resolved after migrating to trpc
//
// For now, the API requires token from query
// and authenticate manually
export default /* #__PURE__*/route<ListAvailableAppsSchema>("ListAvailableAppsSchema", async (req) => {

  const { token } = req.query;

  const info = await validateToken(token);

  if (!info) { return { 403: null }; }

  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "listAvailableApps", {}).then((reply) => {
    return { 200: { apps: reply.apps } };
  });

});
