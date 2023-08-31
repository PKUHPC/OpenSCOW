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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { parseTime } from "@scow/lib-web/build/utils/datetime";
import { RunningJob } from "@scow/protos/build/common/job";
import { AccountServiceClient } from "@scow/protos/build/server/account";
import { JobServiceClient } from "@scow/protos/build/server/job";
import { PlatformRole, TenantRole, UserInfo, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";

type JobAccessible = "OK" | "NotFound" | "NotAllowed" | "LimitNotValid";

type Result = {
  job: RunningJob, jobAccessible: JobAccessible
}

export async function checkJobAccessible(
  jobId: string, cluster: string, info: UserInfo, limitMinutes?: number,
): Promise<Result> {

  const client = getClient(JobServiceClient);

  const result: Result = {} as Result;

  const reply = await asyncClientCall(client, "getRunningJobs", {
    cluster,
    jobIdList: [jobId],
  });

  if (reply.jobs.length === 0) {
    result.jobAccessible = "NotFound";
    result.job = {} as RunningJob;
    return result;
  }

  const job = reply.jobs[0];
  result.job = job;

  // 如果设置的作业时限比该作业运行时间小， 则该作业不可以修改作业时限
  if (!!limitMinutes && (limitMinutes) * 60 * 1000 < parseTime(job.runningTime)) {
    result.jobAccessible = "LimitNotValid";
    return result;
  }


  if (info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)) {
    result.jobAccessible = "OK";
    return result;
  }
  // 用户发起了这个作业
  if (job.user === info.identityId) {
    result.jobAccessible = "OK";
    return result;
  }

  // 用户是这个作业的账户的管理员或者拥有者
  if (info.accountAffiliations.some((x) => x.accountName === job.account && x.role !== UserRole.USER)) {
    result.jobAccessible = "OK";
    return result;
  }

  // 如果用户是租户的管理员，而且这个作业的账户属于这个租户
  if (info.tenantRoles.includes(TenantRole.TENANT_ADMIN)) {
    const { results } = await asyncClientCall(getClient(AccountServiceClient), "getAccounts", {
      accountName: job.account,
      tenantName: info.tenant,
    });

    results.length !== 0 ? result.jobAccessible = "OK" : result.jobAccessible = "NotAllowed";
    return result;
  }

  result.jobAccessible = "NotAllowed";
  return result;

}
