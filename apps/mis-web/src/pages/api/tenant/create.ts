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
import { handlegRPCError } from "src/utils/server";
export interface CreateTenantSchema {
  method: "POST";

  body: {
    name: string;
  }

    responses: {
      204: null;

    /** 租户已经存在 */
      409: null;
  }
}

export default /* #__PURE__*/route<CreateTenantSchema>("CreateTenantSchema", async (req, res) => {

  const { name } = req.body;
  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

  const info = await auth(req, res);

  if (!info) { return; }

  // create tenant on server
  const client = getClient(TenantServiceClient);

  return await asyncClientCall(client, "createTenant", {
    name: name,
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [status.ALREADY_EXISTS]: () => ({ 409: null }),
    }));
});
