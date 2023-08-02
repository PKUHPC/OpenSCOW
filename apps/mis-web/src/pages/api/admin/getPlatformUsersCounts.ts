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
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";

export const GetPlatformUsersCountsResponse = Type.Object({
  totalCount: Type.Number(),
  totalAdminCount: Type.Number(),
  totalFinanceCount: Type.Number(),
});
export type GetPlatformUsersCountsResponse = Static<typeof GetPlatformUsersCountsResponse>;

export const GetPlatformUsersCountsSchema = typeboxRouteSchema({
  method: "GET",

  responses: {
    200: GetPlatformUsersCountsResponse,
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default typeboxRoute(GetPlatformUsersCountsSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const client = getClient(UserServiceClient);

    const result = await asyncClientCall(client, "getPlatformUsersCounts", {});

    return {
      200: result,
    };
  });
