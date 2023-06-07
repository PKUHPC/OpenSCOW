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
import { GetJobsRequest, JobFilter, JobServiceClient } from "@scow/protos/build/server/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { TenantRole } from "src/models/User";
import { Money } from "src/models/UserSchemaModel";
import { getClient } from "src/utils/client";

export const GetJobFilter = Type.Object({

  /**
   * @format date-time
   */
  jobEndTimeStart: Type.Optional(Type.String({})),

  /**
   * @format date-time
   */
  jobEndTimeEnd: Type.Optional(Type.String()),
  /**
   * @minimum 1
   * @type integer
   */
  jobId: Type.Optional(Type.Number()),

  /**
    如果是平台管理员，或者userId是自己，或者（设置了accountName，而且当前用户是accountName账户的管理员或者拥有者），那么
      显示userId用户在accountName中的作业
    否则：403
    */
  userId: Type.Optional(Type.String()),
  accountName: Type.Optional(Type.String()),

  clusters: Type.Optional(Type.Array(Type.String())),
});
export type GetJobFilter = Static<typeof GetJobFilter>;

// Cannot use JobInfo from protos
export const JobInfo = Type.Object({
  biJobIndex: Type.Number(),
  idJob: Type.Number(),
  account: Type.String(),
  user: Type.String(),
  partition: Type.String(),
  nodelist: Type.String(),
  jobName: Type.String(),
  cluster: Type.String(),
  timeSubmit: Type.Optional(Type.String()),
  timeStart: Type.Optional(Type.String()),
  timeEnd: Type.Optional(Type.String()),
  gpu: Type.Number(),
  cpusReq:Type.Number(),
  memReq: Type.Number(),
  nodesReq: Type.Number(),
  cpusAlloc: Type.Number(),
  memAlloc: Type.Number(),
  nodesAlloc: Type.Number(),
  timelimit: Type.Number(),
  timeUsed: Type.Number(),
  timeWait: Type.Number(),
  qos: Type.String(),
  recordTime: Type.Optional(Type.String()),
  accountPrice: Type.Optional(Money),
  tenantPrice: Type.Optional(Money),
});
export type JobInfo = Static<typeof JobInfo>;

export const GetJobsResponse = Type.Object({
  totalCount: Type.Number(),
  jobs: Type.Array(JobInfo),
  totalAccountPrice: Type.Optional(Money),
  totalTenantPrice: Type.Optional(Money),
});
export type GetJobsResponse = Static<typeof GetJobsResponse>;

export const GetJobInfoSchema = typeboxRouteSchema({

  method: "GET",

  query: Type.Object({
    ...GetJobFilter.properties,
    /**
     * @minimum 1
     * @type integer
     */
    page: Type.Optional(Type.Integer({ minimum: 1 })),

    /**
     * @type integer
     */
    pageSize: Type.Optional(Type.Integer()),
  }),

  responses: Type.Object({
    200: GetJobsResponse,

    403: Type.Null(),
  }),
});

export const getJobInfo = async (request: GetJobsRequest) => {

  const client = getClient(JobServiceClient);

  return await asyncClientCall(client, "getJobs", request);
};


export default /* #__PURE__*/typeboxRoute(GetJobInfoSchema, async (req, res) => {
  const auth = authenticate((u) =>
    u.tenantRoles.includes(TenantRole.TENANT_ADMIN) || u.accountAffiliations.length > 0);

  const info = await auth(req, res);

  if (!info) { return; }

  const { page = 1, accountName, userId, jobEndTimeEnd, jobEndTimeStart, jobId, clusters, pageSize } = req.query;

  const filter: JobFilter = {
    tenantName: info.tenant,
    accountName,
    jobEndTimeEnd,
    jobEndTimeStart,
    jobId,
    clusters: clusters ?? [],
  };

  if (
    info.tenantRoles.includes(TenantRole.TENANT_ADMIN)
    || userId === info.identityId
    || (accountName && info.accountAffiliations.find((x) => x.accountName === accountName))
  ) {
    filter.userId = userId;
    filter.accountName = accountName;
  } else {
    return { 403: null };
  }

  const result = await getJobInfo({
    filter,
    page,
    pageSize,
  });

  return {
    200: result,
  };
});
