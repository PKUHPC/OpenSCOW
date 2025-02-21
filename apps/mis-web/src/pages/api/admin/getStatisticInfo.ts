/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { getClient } from "src/utils/client";

export const GetStatisticInfoResponse = Type.Object({
  totalUser: Type.Number(),
  totalAccount: Type.Number(),
  totalTenant: Type.Number(),
  newUser: Type.Number(),
  newAccount: Type.Number(),
  newTenant: Type.Number(),
});

export type GetStatisticInfoResponse = Static<typeof GetStatisticInfoResponse>;


export const GetStatisticInfoSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({

    /**
     * @format date-time
     */
    startTime: Type.String({ format: "date-time" }),

    /**
     * @format date-time
     */
    endTime: Type.String({ format: "date-time" }),

  }),

  responses: {
    200: GetStatisticInfoResponse,
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default typeboxRoute(GetStatisticInfoSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { startTime, endTime } = req.query;

    const client = getClient(AdminServiceClient);

    const results = await asyncClientCall(client, "getStatisticInfo", {
      startTime,
      endTime,
    });

    return {
      200: {
        ...results,
      },
    };
  });
