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
import { GetJobByIdRequest, JobServiceClient } from "@scow/protos/build/server/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { AllJobsInfo } from "src/models/job";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";


export const GetJobByIdResponse = Type.Object({
  job: AllJobsInfo,
});
export type GetJobByIdResponse = Static<typeof GetJobByIdResponse>;

export const GetJobByIdSchema = typeboxRouteSchema({

  method: "GET",

  query: Type.Object({
    clusterId: Type.String(),
    jobId: Type.Number(),
  }),

  responses: {
    200: GetJobByIdResponse,

    403: Type.Null(),

    404: Type.Null(),

  },
});

export const getJobById = async (request: GetJobByIdRequest) => {

  const client = getClient(JobServiceClient);

  return await asyncClientCall(client, "getJobById", request);
};


export default /* #__PURE__*/typeboxRoute(GetJobByIdSchema, async (req, res) => {
  const auth = authenticate((u) =>
    u.platformRoles.includes(TenantRole.TENANT_ADMIN) || u.accountAffiliations.length > 0);

  const info = await auth(req, res);

  if (!info) { return; }

  const { clusterId, jobId } = req.query;

  const { job } = await getJobById({
    clusterId,
    jobId,
  });

  if (!job) {
    return {
      404: null,
    };
  }
  if (job?.user !== info.identityId &&
    !info.tenantRoles.includes(TenantRole.TENANT_ADMIN)) {
    return {
      403: null,
    };
  }

  return {
    200: { job },
  };
});
