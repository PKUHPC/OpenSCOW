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
import { UserServiceClient } from "@scow/protos/build/server/user";
import { authenticate } from "src/auth/server";
import { PlatformRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { handlegRPCError } from "src/utils/server";

export interface CreateUserSchema {
  method: "POST";

  body: {
    /**
     * 用户ID
     */
    identityId: string;
    name: string;
    email: string;

    /**
     * 密码
     */
    password: string;
  }

  responses: {
    200: {
      createdInAuth: boolean;
    };

    400: {
      code: "PASSWORD_NOT_VALID" | "USER_ID_NOT_VALID";
      message: string | undefined;
    }

    /** 用户已经存在 */
    409: null;

    /** 本功能在当前配置下不可用 */
    501: null;
  }
}

const userIdPattern = publicConfig.USERID_PATTERN && new RegExp(publicConfig.USERID_PATTERN);
const passwordPattern = publicConfig.PASSWORD_PATTERN && new RegExp(publicConfig.PASSWORD_PATTERN);

export default /* #__PURE__*/route<CreateUserSchema>("CreateUserSchema", async (req, res) => {

  if (!publicConfig.ENABLE_CREATE_USER) {
    return { 501: null };
  }

  const { email, identityId, name, password } = req.body;

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.some((x) => x.role !== UserRole.USER),
  );

  const info = await auth(req, res);

  if (!info) { return; }

  if (userIdPattern && !userIdPattern.test(identityId)) {
    return { 400: { code: "USER_ID_NOT_VALID", message: publicConfig.USERID_PATTERN_MESSAGE } };
  }

  if (passwordPattern && !passwordPattern.test(password)) {
    return { 400: { code: "PASSWORD_NOT_VALID", message: publicConfig.PASSWORD_PATTERN_MESSAGE } };
  }

  // create user on server
  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "createUser", {
    identityId,
    email: email,
    name: name,
    password,
    tenantName: info.tenant,
  })
    .then((res) => ({ 200: { createdInAuth: res.createdInAuth } }))
    .catch(handlegRPCError({
      [status.ALREADY_EXISTS]: () => ({ 409: null }),
    }));
});
