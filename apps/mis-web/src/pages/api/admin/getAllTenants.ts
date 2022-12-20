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
import { GetAllTenantsResponse, TenantServiceClient } from "@scow/protos/build/server/tenant";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";
export interface GetAllTenantsSchema {
    method: "GET";
    responses: {
        200: GetAllTenantsResponse;
    }
}
const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));
export default route<GetAllTenantsSchema>("GetAllTenantsSchema",
  async (req, res) => {
    const info = await auth(req, res);
    if (!info) {
      return;
    }
    // UserServiceClient
    const client = getClient(TenantServiceClient);
    const result = await asyncClientCall(client, "getAllTenants", {});
    return {
      200:result,
    };
  });
