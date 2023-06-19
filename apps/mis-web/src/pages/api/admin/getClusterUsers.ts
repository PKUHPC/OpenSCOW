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
import { AdminServiceClient } from "@scow/protos/build/server/admin";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { ClusterAccountInfo } from "src/models/UserSchemaModel";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";

// Cannot use GetClusterUsersResponse from protos
export const GetClusterUsersResponse = Type.Object({
  accounts: Type.Array(ClusterAccountInfo),
});
export type GetClusterUsersResponse = Static<typeof GetClusterUsersResponse>;

export const GetClusterUsersSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
  }),

  responses: {
    200: GetClusterUsersResponse,
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default typeboxRoute(GetClusterUsersSchema,
  async (req, res) => {

    // if not initialized, every one can import users
    if (await queryIfInitialized()) {
      const info = await auth(req, res);
      if (!info) { return; }
    }
    const { cluster } = req.query;

    const client = getClient(AdminServiceClient);

    const result = await asyncClientCall(client, "getClusterUsers", {
      cluster,
    });

    return {
      200: result,
    };
  });
