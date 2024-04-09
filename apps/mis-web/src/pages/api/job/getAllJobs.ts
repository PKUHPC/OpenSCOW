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
import { GetAllJobsRequest, GetAllJobsRequest_Filter, JobServiceClient } from "@scow/protos/build/server/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { AllJobsInfo } from "src/models/job";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

const GetAllJobsFilter = Type.Object({
  userId: Type.Optional(Type.String()),
  accountName: Type.Optional(Type.String()),
  states: Type.Optional(Type.Array(Type.String())),
  submitTimeStart: Type.Optional(Type.String()),
  submitTimeEnd: Type.Optional(Type.String()),
  endTimeStart: Type.Optional(Type.String()),
  endTimeEnd: Type.Optional(Type.String()),
});
export type GetAllJobsFilter = Static<typeof GetAllJobsFilter>;



export const GetAllJobsResponse = Type.Object({
  totalPage: Type.Number(),
  jobs: Type.Array(AllJobsInfo),
});
export type GetAllJobsResponse = Static<typeof GetAllJobsResponse>;

export const GetAllJobsSchema = typeboxRouteSchema({

  method: "GET",

  query: Type.Object({
    clusterId: Type.String(),
    ...GetAllJobsFilter.properties,
    page: Type.Optional(Type.Integer({ minimum: 1 })),
    pageSize: Type.Optional(Type.Integer()),
  }),

  responses: {
    200: GetAllJobsResponse,

    403: Type.Null(),

  },
});

export const getJobInfo = async (request: GetAllJobsRequest) => {

  const client = getClient(JobServiceClient);

  return await asyncClientCall(client, "getAllJobs", request);
};


export default /* #__PURE__*/typeboxRoute(GetAllJobsSchema, async (req, res) => {
  const auth = authenticate((u) =>
    u.platformRoles.includes(TenantRole.TENANT_ADMIN) || u.accountAffiliations.length > 0);

  const info = await auth(req, res);

  if (!info) { return; }

  const {
    clusterId, userId, accountName,
    states, submitTimeStart, submitTimeEnd,
    endTimeStart, endTimeEnd, page = 1, pageSize = 10,
  } = req.query;

  const filter: GetAllJobsRequest_Filter = {
    tenant: info.tenant,
    users: [],
    states: states || [],
    accounts: [],
    submitTime: {
      startTime: submitTimeStart,
      endTime: submitTimeEnd,
    },
    endTime: {
      startTime: endTimeStart,
      endTime: endTimeEnd,
    },
  };

  if (
    info.tenantRoles.includes(TenantRole.TENANT_ADMIN)
    || (!!userId && userId === info.identityId)
    || (!!accountName && info.accountAffiliations.find((x) => x.accountName === accountName))
  ) {
    filter.users = userId ? [userId] : [];
    filter.accounts = accountName ? [accountName] : [];
  } else {
    return { 403: null };
  }

  const result = await getJobInfo({
    clusterId,
    filter,
    pageInfo: {
      page,
      pageSize,
    },
  });

  return {
    200: result,
  };
});
