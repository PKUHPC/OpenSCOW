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

import { typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { DesktopServiceClient } from "@scow/protos/build/portal/desktop";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { getLoginDesktopEnabled } from "src/utils/config";
import { handlegRPCError } from "src/utils/server";

export const LaunchDesktopSchema = typeboxRouteSchema({
  method: "POST",

  body:  Type.Object({
    displayId: Type.Number(),
    cluster: Type.String(),
    loginNode: Type.String(),

  }),

  responses: {
    200: Type.Object({
      host: Type.String(),
      port: Type.Number(),
      password: Type.String(),
    }),
    // 功能没有启用
    501: Type.Object({ code: Type.Literal("CLUSTER_LOGIN_DESKTOP_NOT_ENABLED") }),
  },
});


const auth = authenticate(() => true);

export default /* #__PURE__*/typeboxRoute(LaunchDesktopSchema, async (req, res) => {
  const { cluster, loginNode, displayId } = req.body;

  const loginDesktopEnabled = getLoginDesktopEnabled(cluster);

  if (!loginDesktopEnabled) {
    return { 501: { code: "CLUSTER_LOGIN_DESKTOP_NOT_ENABLED" as const } };
  }

  const info = await auth(req, res);

  if (!info) { return; }


  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "connectToDesktop", {
    cluster, loginNode, displayId, userId: info.identityId,
  }).then(async ({ host, password, port }) => ({ 200: {
    host,
    password,
    port,
  } }), handlegRPCError({

  }));
});
