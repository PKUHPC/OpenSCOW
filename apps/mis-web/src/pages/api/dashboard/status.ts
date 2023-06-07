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
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { AccountStatus } from "src/models/UserSchemaModel";
import { getClient } from "src/utils/client";

// Cannot use GetUserStatusResponse from protos
export const GetUserStatusResponse = Type.Object({
  /** account and its status */
  accountStatuses: Type.Record(Type.String(), AccountStatus),
  /** cluster and quota */
  storageQuotas: Type.Record(Type.String(), Type.Number()),
});
export type GetUserStatusResponse = Static<typeof GetUserStatusResponse>;

export const GetUserStatusSchema = typeboxRouteSchema({

  method: "GET",

  responses: {
    200: GetUserStatusResponse,
  },
});

export const getUserStatus = async (userId: string, tenant: string) => {

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "getUserStatus", {
    tenantName: tenant,
    userId,
  });
};

export default typeboxRoute(GetUserStatusSchema, async (req, res) => {
  const auth = authenticate((i) => i.accountAffiliations.length > 0);

  const info = await auth(req, res);

  if (!info) { return; }

  const result = await getUserStatus(info.identityId, info.tenant);

  return {
    200: result,
  };
});
