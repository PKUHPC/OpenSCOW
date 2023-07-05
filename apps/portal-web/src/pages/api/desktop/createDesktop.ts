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
import { status } from "@grpc/grpc-js";
import { DesktopServiceClient } from "@scow/protos/build/portal/desktop";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { handlegRPCError } from "src/utils/server";

export const CreateDesktopSchema = typeboxRouteSchema({
  method: "POST",

  body: Type.Object({
    cluster: Type.String(),
    loginNode: Type.String(),

    // the name of the wm
    wm: Type.String(),

    // the name of the desktop
    desktopName: Type.String(),
  }),

  responses: {
    200: Type.Object({
      host: Type.String(),
      port: Type.Number(),
      password: Type.String(),
    }),

    400: Type.Object({
      code: Type.Union([Type.Literal("INVALID_WM"), Type.Literal("INVALID_CLUSTER")]),
    }),

    409: Type.Object({
      code: Type.Literal("TOO_MANY_DESKTOPS"),
    }),

    // 功能没有启用
    501: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default /* #__PURE__*/typeboxRoute(CreateDesktopSchema, async (req, res) => {

  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, loginNode, wm, desktopName } = req.body;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "createDesktop", {
    cluster, loginNode, userId: info.identityId, wm, desktopName,
  }).then(
    async ({ host, password, port }) => ({
      200: { host, password, port },
    }),
    handlegRPCError({
      [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
      [status.INVALID_ARGUMENT]: () => ({ 400: { code: "INVALID_WM" as const } }),
      [status.RESOURCE_EXHAUSTED]: () => ({ 409: { code: "TOO_MANY_DESKTOPS" as const } }),
    }));


});
