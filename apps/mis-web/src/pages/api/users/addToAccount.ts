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

import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { UserServiceClient } from "src/generated/server/user";
import { PlatformRole, UserRole } from "src/models/User";
import { checkNameMatch } from "src/server/checkIdNameMatch";
import { getClient } from "src/utils/client";
import { handleGrpcClusteropsError, InternalErrorInfo } from "src/utils/internalError";
import { handlegRPCError } from "src/utils/server";

export interface AddUserToAccountSchema {
  method: "POST";

  body: {
    identityId: string;
    accountName: string;
    name: string;
  }

  responses: {
    204: null;

    400: {
      code: "ID_NAME_NOT_MATCH";
    }

    404: {
      code: "ACCOUNT_NOT_FOUND" | "USER_NOT_FOUND";
    }

    /** 用户已经存在 */
    409: null;

    500: InternalErrorInfo;
  }
}

export default /* #__PURE__*/route<AddUserToAccountSchema>("AddUserToAccountSchema", async (req, res) => {
  const { identityId, accountName, name } = req.body;

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.find((x) => x.accountName === accountName)?.role !== UserRole.USER);

  const info = await auth(req, res);

  if (!info) { return; }

  const result = await checkNameMatch(identityId, name);

  if (result === "NotFound") {
    return { 404: { code: "USER_NOT_FOUND" } };
  }

  if (result === "NotMatch") {
    return { 400: { code: "ID_NAME_NOT_MATCH" } };
  }

  // call ua service to add user
  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "addUserToAccount", {
    tenantName: info.tenant,
    accountName,
    userId: identityId,
  }).then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [Status.INTERNAL]: handleGrpcClusteropsError,
      [Status.ALREADY_EXISTS]: () => ({ 409: null }),
      [Status.NOT_FOUND]: () => ({ 404: { code: "ACCOUNT_NOT_FOUND" as const } }),
    }));
});
