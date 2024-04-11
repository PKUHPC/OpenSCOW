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
import { JobServiceClient } from "@scow/protos/build/server/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";

export const GetTopSubmitJobUserNameResponse = Type.Object({
  results: Type.Array(Type.Object({
    userName: Type.String(),
    count: Type.Number(),
  })),
});

export type GetTopSubmitJobUserNameResponse = Static<typeof GetTopSubmitJobUserNameResponse>;


export const GetTopSubmitJobUserNameSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({

    startTime: Type.String({ format: "date-time" }),

    endTime: Type.String({ format: "date-time" }),

    // 不传默认为10
    topRank: Type.Optional(Type.Number()),

  }),

  responses: {
    200: GetTopSubmitJobUserNameResponse,
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default typeboxRoute(GetTopSubmitJobUserNameSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { startTime, endTime, topRank } = req.query;

    const client = getClient(JobServiceClient);

    const { results } = await asyncClientCall(client, "getTopSubmitJobUserName", {
      startTime,
      endTime,
      topRank,
    });

    return {
      200: {
        results,
      },
    };
  });
