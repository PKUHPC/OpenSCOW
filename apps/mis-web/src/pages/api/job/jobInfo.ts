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

import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { GetJobsReply, GetJobsRequest, JobFilter, JobServiceClient } from "src/generated/server/job";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetJobFilter {

    /**
     * @format date-time
     */
    jobEndTimeStart: string;

    /**
     * @format date-time
     */
    jobEndTimeEnd: string;
    /**
     * @minimum 1
     * @type integer
     */
    jobId?: number;

    /**
      如果是平台管理员，或者userId是自己，或者（设置了accountName，而且当前用户是accountName账户的管理员或者拥有者），那么
        显示userId用户在accountName中的作业
      否则：403
     */
    userId?: string;
    accountName?: string;

    clusters?: string[];
}

export interface GetJobInfoSchema {

  method: "GET";

  query: GetJobFilter & {

    /**
     * @minimum 1
     * @type integer
     */
    page?: number;

    /**
     * @type integer
     */
    pageSize?: number;

  };

  responses: {
    200: GetJobsReply;

    403: null;
  }
}

export const getJobInfo = async (request: GetJobsRequest) => {

  const client = getClient(JobServiceClient);

  return await asyncClientCall(client, "getJobs", request);
};


export default /* #__PURE__*/route<GetJobInfoSchema>("GetJobInfoSchema", async (req, res) => {
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
