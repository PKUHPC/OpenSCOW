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
import { RunningJob } from "@scow/protos/build/common/job";
import { GetRunningJobsRequest, JobServiceClient } from "@scow/protos/build/server/job";
import { authenticate } from "src/auth/server";
import { PlatformRole, TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetRunningJobsSchema {

  method: "GET";

  query: {

    /**
      如果是平台管理员，那么不输入租户名，否则都只看当前租户的
      如果userId是自己，或者（设置了accountName，而且当前用户是accountName账户的管理员或者拥有者），那么
        显示userId用户在accountName中的作业
      否则：403
     */
    userId?: string;
    accountName?: string;

    cluster: string;
  }

  responses: {
    200: {
      results: RunningJob[];
    }


    403: null;
  }
}

export const getRunningJobs = async (request: GetRunningJobsRequest) => {

  const client = getClient(JobServiceClient);

  const reply = await asyncClientCall(client, "getRunningJobs", request);

  return reply.jobs;
};


export default route<GetRunningJobsSchema>("GetRunningJobsSchema", async (req, res) => {
  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.tenantRoles.includes(TenantRole.TENANT_ADMIN) ||
    u.accountAffiliations.length > 0);

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, userId, accountName } = req.query;

  const filter: GetRunningJobsRequest = {
    cluster,
    jobIdList: [],
  };

  if (!info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)) {
    filter.tenantName = info.tenant;
  }

  if (info.tenantRoles.includes(TenantRole.TENANT_ADMIN)
    || userId === info.identityId
    || (accountName && info.accountAffiliations.find((x) => x.accountName === accountName))
  ) {
    filter.userId = userId;
    filter.accountName = accountName;
  } else {
    return { 403: null };
  }

  const results = await getRunningJobs(filter);

  return {
    200: { results },
  };
});
