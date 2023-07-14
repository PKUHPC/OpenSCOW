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
import { publicConfig } from "src/utils/config";

export const ListDesktopsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    loginNode: Type.Optional(Type.String()),
  }),

  responses: {
    200: Type.Object({
      userDesktops: Type.Array(Type.Object({
        host: Type.String(),
        displayId: Type.Array(Type.Number()),
      })),
    }),

    // 功能没有启用
    501: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default /* #__PURE__*/typeboxRoute(ListDesktopsSchema, async (req, res) => {

  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, loginNode } = req.query;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "listUserDesktops", {
    cluster, loginNode, userId: info.identityId,
  }).then(async ({ userDesktops }) => ({
    200: {
      userDesktops:
        userDesktops.map((userDesktop) => ({ host: userDesktop.host, displayId: userDesktop.displayIds })),
    },
  }));

});
