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
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

// Cannot use AvailableWm from protos
export const AvailableWm = Type.Object({
  name: Type.String(),
  wm: Type.String(),
});
export type AvailableWm = Static<typeof AvailableWm>;

export const ListAvailableWmsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
  }),

  responses: {
    200: Type.Object({
      wms: Type.Array(AvailableWm),
    }),

    // 功能没有启用
    501: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default /* #__PURE__*/typeboxRoute(ListAvailableWmsSchema, async (req, res) => {



  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "listAvailableWms", { cluster }).then(({ wms }) => ({ 200: { wms } }));
});
