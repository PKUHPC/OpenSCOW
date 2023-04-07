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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AccountServiceClient, CreateAccountResponse } from "@scow/protos/build/server/account";
import { authenticate } from "src/auth/server";
import { TenantRole } from "src/models/User";
import { checkNameMatch } from "src/server/checkIdNameMatch";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface CreateAccountSchema {
  method: "POST";

  body: {
    /**
     * 账户名
     */
    accountName: string;
    ownerId: string;
    ownerName: string;
    comment?: string;
  }

  responses: {
    200: CreateAccountResponse;
    400: {
      code: "ID_NAME_NOT_MATCH" | "ACCOUNT_NAME_NOT_VALID";
    }
    /** ownerId不存在 */
    404: null;
    409: null;
  }
}

const accountNameRegex = publicConfig.ACCOUNT_NAME_PATTERN ? new RegExp(publicConfig.ACCOUNT_NAME_PATTERN) : undefined;

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<CreateAccountSchema>("CreateAccountSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { accountName, ownerId, ownerName, comment } = req.body;

    if (accountNameRegex && !accountNameRegex.test(accountName)) {
      return { 400: {
        code: "ACCOUNT_NAME_NOT_VALID",
        message: `Account name must match ${publicConfig.ACCOUNT_NAME_PATTERN}`,
      } };
    }

    // check whether id and name matches
    const result = await checkNameMatch(ownerId, ownerName);

    if (result === "NotFound") {
      return { 404: null };
    }

    if (result === "NotMatch") {
      return { 400: { code: "ID_NAME_NOT_MATCH" } };
    }

    const client = getClient(AccountServiceClient);

    return await asyncClientCall(client, "createAccount", {
      accountName, ownerId, comment, tenantName: info.tenant,
    })
      .then((x) => ({ 200: x }))
      .catch(handlegRPCError({
        [Status.ALREADY_EXISTS]: () => ({ 409: null }),
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
