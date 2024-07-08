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

import { RunningJob } from "@scow/protos/build/common/job";
import { JobInfo as PortalJobInfo } from "@scow/protos/build/portal/job";
import { JobInfo } from "@scow/scheduler-adapter-protos/build/protos/job";

import { formatTime } from "./time";

export const jobInfoToRunningjob = (jobInfo: JobInfo) => {
  return {
    jobId: jobInfo.jobId.toString(),
    partition: jobInfo.partition,
    name: jobInfo.name,
    user: jobInfo.user,
    state: jobInfo.state,
    runningTime: jobInfo.elapsedSeconds !== undefined ? formatTime(jobInfo.elapsedSeconds * 1000) : "",
    nodes: jobInfo.nodesAlloc!.toString(),
    nodesOrReason: jobInfo.state === "RUNNING" ? jobInfo.nodeList! : jobInfo.reason,
    account: jobInfo.account,
    cores: (jobInfo.cpusAlloc ?? 0).toString(),
    gpus: (jobInfo.gpusAlloc ?? 0).toString(),
    qos: jobInfo.qos,
    submissionTime: jobInfo.submitTime!,
    timeLimit: jobInfo.timeLimitMinutes ? formatTime(jobInfo.timeLimitMinutes * 60 * 1000) : "",
    workingDir: jobInfo.workingDirectory,
  } as RunningJob;
};

export const jobInfoToPortalJobInfo = (jobInfo: JobInfo) => {
  return {
    jobId: jobInfo.jobId,
    name: jobInfo.name,
    account: jobInfo.account,
    partition: jobInfo.partition,
    qos: jobInfo.qos,
    state: jobInfo.state,
    workingDirectory: jobInfo.workingDirectory,
    reason: jobInfo.reason,
    elapsed: jobInfo.elapsedSeconds !== undefined ? formatTime(jobInfo.elapsedSeconds * 1000) : "",
    timeLimit: jobInfo.timeLimitMinutes ? formatTime(jobInfo.timeLimitMinutes * 60 * 1000) : "",
    submitTime: jobInfo.submitTime!,
    startTime: jobInfo.startTime,
    endTime: jobInfo.endTime,
  } as PortalJobInfo;
};
