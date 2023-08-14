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
import { JobInfo as JobInfoEntity } from "src/entities/JobInfo";

export function toGrpc(x: JobInfoEntity) {
  return <JobInfo>{
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
  };
}
