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
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { AppServiceClient } from "@scow/protos/build/portal/app";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

// Cannot use AppSession from protos
export const AppSession = Type.Object({
  sessionId: Type.String(),
  jobId: Type.Number(),
  submitTime: Type.Optional(Type.String()),
  appId: Type.String(),
  appName: Type.Optional(Type.String()),
  state: Type.String(),
  dataPath: Type.String(),
  runningTime: Type.String(),
  timeLimit: Type.String(),
  reason: Type.Optional(Type.String()),
  host: Type.Optional(Type.String()),
  port: Type.Optional(Type.Number()),
});
export type AppSession = Static<typeof AppSession>

export const GetAppSessionsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
  }),

  responses: {
    200: Type.Object({
      sessions: Type.Array(AppSession),
    }),

    503: Type.Object({
      code: Type.Literal("SERVICE_UNAVAILABLE"),
      message: Type.String(),
    }),
  },
});

const auth = authenticate(() => true);

export default /* #__PURE__*/typeboxRoute(GetAppSessionsSchema, async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "listAppSessions", {
    cluster, userId: info.identityId,
  }).then((reply) => ({ 200: { sessions: reply.sessions } }), handlegRPCError({
    [status.CANCELLED]: (err) => ({ 503: { code: "SERVICE_UNAVAILABLE", message: err.details } } as const),
    [status.INTERNAL]: (err) => ({ 503: { code: "SERVICE_UNAVAILABLE", message: err.details } } as const),
  }),
  );

});
