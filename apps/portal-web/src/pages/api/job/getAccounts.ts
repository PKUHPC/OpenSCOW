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
import { status } from "@grpc/grpc-js";
import { JobServiceClient } from "@scow/protos/build/portal/job";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { AccountStatusFilter } from "src/models/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export const GetAccountsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    statusFilter: Type.Optional(Type.Enum(AccountStatusFilter)),
  }),

  responses: {
    200: Type.Object({
      accounts: Type.Array(Type.String()),
    }),
    404: Type.Object({
      code: Type.Literal("ACCOUNT_NOT_FOUND"),
      message: Type.String(),
    }),
  },
});
const auth = authenticate(() => true);

export default route(GetAccountsSchema, async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, statusFilter } = req.query;

  const client = getClient(JobServiceClient);

  const result = asyncUnaryCall(client, "listAccounts", {
    cluster, userId: info.identityId, statusFilter,
  }).then(({ accounts }) => ({ 200: { accounts } }), handlegRPCError({
    [status.NOT_FOUND]: (err) => ({ 404: { code: "ACCOUNT_NOT_FOUND", message: err.details } } as const),
    [status.INTERNAL]: (err) => ({ 404: { code: "ACCOUNT_NOT_FOUND", message: err.details } } as const),
  }),
  );

  return result;

});
