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
import { AppServiceClient } from "@scow/protos/build/portal/app";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";

// Cannot use SubmissionInfo from protos
export const SubmissionInfo = Type.Object({
  userId: Type.String(),
  cluster: Type.String(),
  appId: Type.String(),
  appName: Type.String(),
  account: Type.String(),
  partition: Type.Optional(Type.Union([Type.String(), Type.Undefined()])),
  qos: Type.Optional(Type.Union([Type.String(), Type.Undefined()])),
  nodeCount: Type.Number(),
  coreCount: Type.Number(),
  gpuCount: Type.Optional(Type.Number()),
  maxTime: Type.Number(),
  submitTime: Type.Optional(Type.String()),
  customAttributes: Type.Record(Type.String(), Type.String()),
});

export type SubmissionInfo = Static<typeof SubmissionInfo>;


export const GetAppLastSubmissionSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    appId: Type.String(),
  }),

  responses: {
    200: Type.Object({
      lastSubmissionInfo: Type.Optional(SubmissionInfo),
    }),
  },
});

const auth = authenticate(() => true);

export default /* #__PURE__*/typeboxRoute(GetAppLastSubmissionSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, appId } = req.query;
  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "getAppLastSubmission", {
    userId: info.identityId, cluster, appId,
  }).then(({ lastSubmissionInfo }) => ({ 200: { lastSubmissionInfo: lastSubmissionInfo } }));
});
