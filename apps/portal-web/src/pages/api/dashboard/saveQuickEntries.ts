/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { DashboardServiceClient } from "@scow/protos/build/portal/dashboard";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

import { Entry } from "./getQuickEntries";

export const SaveQuickEntriesSchema = typeboxRouteSchema({
  method: "POST",

  body: Type.Object({
    quickEntries: Type.Array(Entry),
  }),
  responses: {
    204: Type.Null(),

    500: Type.Object({ code: Type.Literal("WRITE_FILE_FAILED") }),
  },
});

const auth = authenticate(() => true);

export default route(SaveQuickEntriesSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }
  const { quickEntries } = req.body;
  const client = getClient(DashboardServiceClient);

  return await asyncUnaryCall(client, "saveQuickEntries", {
    userId:info.identityId,
    quickEntries,
  }).then(() => ({ 204:null }),
  );

});
