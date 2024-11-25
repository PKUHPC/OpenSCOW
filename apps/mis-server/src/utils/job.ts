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

import { decimalToMoney } from "@scow/lib-decimal";
import { JobInfo } from "@scow/protos/build/common/ended_job";
import { JobsOfAccountAndUserTarget, JobsOfAccountTarget, JobsOfJobIdAndAccountTarget, JobsOfJobIdAndUserTarget,
  JobsOfJobIdTarget, JobsOfTenantTarget, JobsOfUserTarget } from "@scow/protos/build/server/job";
import { JobInfo as JobInfoEntity } from "src/entities/JobInfo";

export function toGrpc(x: JobInfoEntity) {
  return {
    account: x.account,
    biJobIndex: x.biJobIndex,
    cluster: x.cluster,
    cpusAlloc: x.cpusAlloc,
    cpusReq: x.cpusReq,
    gpu: x.gpu,
    idJob: x.idJob,
    jobName: x.jobName,
    memAlloc: x.memAlloc,
    memReq: x.memReq,
    nodelist: x.nodelist,
    nodesAlloc: x.nodesAlloc,
    nodesReq: x.nodesReq,
    partition: x.partition,
    qos: x.qos,
    recordTime: x.recordTime.toISOString(),
    timeEnd: x.timeEnd.toISOString(),
    timeStart: x.timeStart.toISOString(),
    timeSubmit: x.timeSubmit.toISOString(),
    timeUsed: x.timeUsed,
    timeWait: x.timeWait,
    timelimit: x.timelimit,
    user: x.user,
    tenantPrice: decimalToMoney(x.tenantPrice),
    accountPrice: decimalToMoney(x.accountPrice),
  } as JobInfo;
}

export const getJobsTargetSearchParam = (target:
| { $case: "jobsOfJobId";jobsOfJobId: JobsOfJobIdTarget; }
| { $case: "jobsOfJobIdAndUser";jobsOfJobIdAndUser: JobsOfJobIdAndUserTarget; }
| { $case: "jobsOfJobIdAndAccount";jobsOfJobIdAndAccount: JobsOfJobIdAndAccountTarget; }
| { $case: "jobsOfAccountAndUser"; jobsOfAccountAndUser: JobsOfAccountAndUserTarget }
| { $case: "jobsOfAccount"; jobsOfAccount: JobsOfAccountTarget }
| { $case: "jobsOfUser"; jobsOfUser: JobsOfUserTarget }
| { $case: "jobsOfTenant"; jobsOfTenant: JobsOfTenantTarget },
): { tenant: string, account?: string | { $ne: null },
  user?: string | { $ne: null }, idJob?: number | { $ne: null } } => {



  const { accountName, tenantName, userId, jobId } = target[target.$case];

  let searchParam: {
    tenant: string,
    account?: string | { $ne: null },
    user?: string | { $ne: null },
    idJob?: number | { $ne: null },
  } = { tenant: tenantName };

  switch (target?.$case)
  {
    case "jobsOfJobId":
      searchParam = { tenant: tenantName, idJob: jobId };
      break;
    case "jobsOfJobIdAndUser":
      searchParam = { tenant: tenantName, idJob: jobId, user: userId };
      break;
    case "jobsOfJobIdAndAccount":
      searchParam = { tenant: tenantName, idJob: jobId, account: accountName };
      break;
    case "jobsOfAccountAndUser":
      searchParam = { tenant: tenantName, account: accountName, user: userId };
      break;
    case "jobsOfAccount": {
      searchParam = { tenant: tenantName, account: accountName };
      break;
    }
    case "jobsOfUser": {
      searchParam = { tenant: tenantName, user: userId };
      break;
    }
    case "jobsOfTenant": {
      break;
    }
    default:
      break;
  }
  return searchParam;
};

