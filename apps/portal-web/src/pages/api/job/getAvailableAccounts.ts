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
import { JobServiceClient } from "@scow/protos/build/portal/job";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export const GetAvailableAccountsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    accounts: Type.Array(Type.String()),
  }),

  responses: {
    200: Type.Object({
      accounts: Type.Array(Type.String()),
    }),
  },
});
const auth = authenticate(() => true);

export default route(GetAvailableAccountsSchema, async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, accounts } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "getAvailableAccounts", {
    cluster, accounts, userId: info.identityId,
  }).then(({ accounts }) => ({ 200: { accounts } }));

});
