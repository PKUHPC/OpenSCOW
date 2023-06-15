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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { JobServiceClient } from "@scow/protos/build/portal/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

// Cannot use JobInfo from protos
export const JobInfo = Type.Object({
  jobId: Type.Number(),
  name: Type.String(),
  account: Type.String(),
  partition: Type.String(),
  qos: Type.String(),
  state: Type.String(),
  workingDirectory: Type.String(),
  reason: Type.String(),
  elapsed: Type.String(),
  timeLimit: Type.String(),
  submitTime: Type.String(),
  startTime: Type.Optional(Type.Union([Type.String(), Type.Undefined()])),
  endTime: Type.Optional(Type.Union([Type.String(), Type.Undefined()])),
});

export type JobInfo = Static<typeof JobInfo>;

export const GetAllJobsSchema = typeboxRouteSchema({

  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    startTime: Type.String(),
    endTime: Type.String(),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(JobInfo),
    }),

    403: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default route(GetAllJobsSchema, async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, startTime, endTime } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listAllJobs", {
    userId: info.identityId, cluster,
    startTime, endTime,
  }).then(({ results }) => ({ 200: { results } }));

});
