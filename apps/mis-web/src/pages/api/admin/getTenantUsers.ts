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
import { authenticate } from "src/auth/server";
import { UserServiceClient } from "src/generated/server/user";
import { FullUserInfo, TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetTenantUsersSchema {
  method: "GET";

  responses: {
    200: {
      results: FullUserInfo[];
    }
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<GetTenantUsersSchema>("GetTenantUsersSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const client = getClient(UserServiceClient);
    const { users } = await asyncClientCall(client, "getUsers", {
      tenantName: info.tenant,
    });

    // aggregate the result
    const combined: FullUserInfo[] = users.map((x) => ({
      accountAffiliations: x.accountAffiliations,
      createTime: x.createTime || "",
      email: x.email,
      id: x.userId,
      name: x.name,
      tenantRoles: x.tenantRoles,
    }));


    return { 200: { results: combined } };
  });
