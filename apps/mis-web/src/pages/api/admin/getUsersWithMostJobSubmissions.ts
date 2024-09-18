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
import { JobServiceClient } from "@scow/protos/build/server/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";

export const GetUsersWithMostJobSubmissionsResponse = Type.Object({
  results: Type.Array(Type.Object({
    userName: Type.String(),
    userId:Type.String(),
    count: Type.Number(),
  })),
});

// 定义错误相应类型
export const ErrorResponse = Type.Object({
  message: Type.String(),
});

export type GetUsersWithMostJobSubmissionsResponse = Static<typeof GetUsersWithMostJobSubmissionsResponse>;


export const GetUsersWithMostJobSubmissionsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({

    startTime: Type.String({ format: "date-time" }),

    endTime: Type.String({ format: "date-time" }),

    // 最大为10，不传默认为10
    topNUsers: Type.Optional(Type.Number()),

  }),

  responses: {
    200: GetUsersWithMostJobSubmissionsResponse,
    400: ErrorResponse,
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default typeboxRoute(GetUsersWithMostJobSubmissionsSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }


    const { startTime, endTime, topNUsers } = req.query;
    // 检查 topNUsers 是否符合要求
    if (typeof topNUsers == "number" && (topNUsers > 10 || topNUsers < 0)) {
      res.status(400).send({ message: "Parameter topNUsers must be between 0 and 10." });
      return;
    };

    const client = getClient(JobServiceClient);

    const { results } = await asyncClientCall(client, "getUsersWithMostJobSubmissions", {
      startTime,
      endTime,
      topNUsers,
    });

    return {
      200: {
        results,
      },
    };
  });
