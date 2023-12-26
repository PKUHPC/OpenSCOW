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
import { StatisticServiceClient } from "@scow/protos/build/audit/statistic";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { getAuditClient } from "src/utils/client";

export const GetPortalUsageCountResponse = Type.Object({
  results: Type.Array(Type.Object({
    operationType: Type.String(),
    count: Type.Number(),
  })),
});

export type GetPortalUsageCountResponse = Static<typeof GetPortalUsageCountResponse>;


export const GetPortalUsageCountSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({

    startTime: Type.String({ format: "date-time" }),

    endTime: Type.String({ format: "date-time" }),

  }),

  responses: {
    200: GetPortalUsageCountResponse,
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default typeboxRoute(GetPortalUsageCountSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { startTime, endTime } = req.query;

    const client = getAuditClient?.(StatisticServiceClient);

    if (client) {
      const { results } = await asyncClientCall(client, "getPortalUsageCount", {
        startTime,
        endTime,
      });
      return {
        200: {
          results,
        },
      };
    }
    return {
      200: {
        results: [],
      },
    };
  });
