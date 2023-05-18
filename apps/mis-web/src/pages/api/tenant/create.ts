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
import { status } from "@grpc/grpc-js";
import { TenantServiceClient } from "@scow/protos/build/server/tenant";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { getUserIdRule } from "src/utils/createUser";
import { handlegRPCError } from "src/utils/server";
export interface CreateTenantSchema {
  method: "POST";

  body: {
    tenantName: string;
    userId: string,
    userName: string,
    userEmail: string,
    userPassword: string,
  }

    responses: {
      200: {
        createdInAuth: boolean;
      };

      400: {
        code: "PASSWORD_NOT_VALID" | "USERID_NOT_VALID";
        message: string | undefined;
      }

    /** 租户已经存在 */
      409: {
        code: "TENANT_ALREADY_EXISTS" | "USER_ALREADY_EXISTS",
        message: string;
      };

      500: null;
  }
}

const passwordPattern = publicConfig.PASSWORD_PATTERN && new RegExp(publicConfig.PASSWORD_PATTERN);

export default /* #__PURE__*/route<CreateTenantSchema>("CreateTenantSchema", async (req, res) => {

  const { tenantName, userId, userName, userEmail, userPassword } = req.body;

  const userIdRule = getUserIdRule();

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

  const info = await auth(req, res);

  if (!info) { return; }

  if (userIdRule && !userIdRule.pattern.test(userId)) {
    return { 400: { code: "USERID_NOT_VALID", message: userIdRule.message } };
  }

  if (passwordPattern && !passwordPattern.test(userPassword)) {
    return { 400: { code: "PASSWORD_NOT_VALID", message: publicConfig.PASSWORD_PATTERN_MESSAGE } };
  }

  // create tenant on server
  const client = getClient(TenantServiceClient);

  return await asyncClientCall(client, "createTenant", {
    tenantName: tenantName,
    userId: userId,
    userName: userName,
    userEmail: userEmail,
    userPassword: userPassword,
  })
    .then((res) => ({ 200: { createdInAuth: res.createdInAuth } }))
    .catch(handlegRPCError({
      [status.ALREADY_EXISTS]: (e) => {
        return {
          409: e.details === "TENANT_ALREADY_EXISTS"
            ? {
              code: "TENANT_ALREADY_EXISTS" as const,
              message: `Tenant with tenantName ${tenantName} already exists`,
            }
            : { code: "USER_ALREADY_EXISTS" as const, message: `User with userId ${userId} already exists` },
        };
      },
    }));
});
