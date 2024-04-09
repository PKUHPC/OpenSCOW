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

import type { RunningJob } from "@scow/protos/build/common/job";
import { Static, Type } from "@sinclair/typebox";
import dayjs from "dayjs";
import { Lang } from "react-typed-i18n";
import en from "src/i18n/en";
import type { Cluster } from "src/utils/config";

import { Money } from "./UserSchemaModel";


export type RunningJobInfo = RunningJob & { cluster: Cluster; runningOrQueueTime: string };

export const RunningJobInfo = {
  fromGrpc: (info: RunningJob, cluster: Cluster): RunningJobInfo => ({
    ...info,
    cluster,
    runningOrQueueTime: calculateRunningOrQueueTime(info),
  }),
};

function pad(num: number) {
  return num >= 10 ? num : "0" + num;
}

function calculateRunningOrQueueTime(r: RunningJob) {
  if (r.state !== "PENDING") {
    return r.runningTime;
  }

  // calculate to format [{days}-][{Hours}:]{MM}:{SS}
  const diffMs = dayjs().diff(r.submissionTime);
  const seconds = diffMs / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  let text = "";
  text += days >= 1 ? Math.floor(days) + "-" : "";
  const hoursModulo = Math.floor(hours % 24);
  text += hours >= 1 ? pad(hoursModulo) + ":" : "";
  const minModulo = Math.floor(minutes % 60);
  text += pad(minModulo);
  text += ":";
  const secModulo = Math.floor(seconds % 60);
  text += pad(secModulo);

  return text;
}

export function runningJobId(r: RunningJobInfo) {
  return `${r.cluster.id}:${r.jobId}`;
}

export enum AmountStrategy {
  MAX_CPUSALLOC_MEM = "max-cpusAlloc-mem",
  MAX_GPU_CPUSALLOC = "max-gpu-cpusAlloc",
  GPU = "gpu",
  CPUS_ALLOC = "cpusAlloc"
}

// export const AmountStrategyText = "计量方式";
// export const AmountStrategyDescription = "确定作业的用量的方式";

// export const AmountStrategyDescriptions: Record<AmountStrategy, string> = {
//   "max-cpusAlloc-mem": "CPU和内存分配量",
//   "max-gpu-cpusAlloc": "GPU和CPU分配量",
//   "gpu": "GPU分配量",
//   "cpusAlloc": "CPU分配量",
// };
// export const AmountStrategyAlgorithmDescriptions: Record<AmountStrategy, string> = {
//   "max-cpusAlloc-mem": "max(cpusAlloc, 向上取整(memReq / (分区内存量/分区核心数)))",
//   "max-gpu-cpusAlloc": "max(gpu, 向上取整(cpusAlloc / (分区核心数/分区gpu数)))",
//   "gpu": "gpu",
//   "cpusAlloc": "cpusAlloc",
// };

export type TransType = (id: Lang<typeof en>, args?: React.ReactNode[]) => string;
export const getAmountStrategyText = (t: TransType) => {
  return t("AmountStrategy.text");
};
export const getAmountStrategyDescription = (t: TransType) => {
  return t("AmountStrategy.description");
};

export const getAmountStrategyDescriptions = (t: TransType): Record<AmountStrategy, string> => {
  return {
    "max-cpusAlloc-mem": t("AmountStrategy.descriptionMaxCpusMem"),
    "max-gpu-cpusAlloc": t("AmountStrategy.descriptionMaxGpuCpus"),
    "gpu": t("AmountStrategy.descriptionGpu"),
    "cpusAlloc": t("AmountStrategy.descriptionCpus"),
  };
};
export const getAmountStrategyAlgorithmDescriptions = (t: TransType): Record<AmountStrategy, string> => {
  return {
    "max-cpusAlloc-mem": t("AmountStrategy.algorithmMaxCpusMem"),
    "max-gpu-cpusAlloc": t("AmountStrategy.algorithmMaxGpuCpus"),
    "gpu": t("AmountStrategy.algorithmGpu"),
    "cpusAlloc": t("AmountStrategy.algorithmCpus"),
  };
};


export const AllJobsInfo = Type.Object({
  jobId: Type.Number(),
  name: Type.String(),
  account: Type.String(),
  user: Type.String(),
  partition: Type.String(),
  qos: Type.String(),
  state: Type.String(),
  cpusReq: Type.Number(),
  memReqMb: Type.Number(),
  nodesReq: Type.Number(),
  timeLimitMinutes: Type.Number(),
  submitTime: Type.Optional(Type.String()),
  workingDirectory: Type.String(),
  stdoutPath: Type.Optional(Type.String()),
  stderrPath: Type.Optional(Type.String()),
  startTime: Type.Optional(Type.String()),
  elapsedSeconds: Type.Optional(Type.Number()),
  reason: Type.Optional(Type.String()),
  nodeList: Type.Optional(Type.String()),
  gpusAlloc: Type.Optional(Type.Number()),
  cpusAlloc: Type.Optional(Type.Number()),
  memAllocMb: Type.Optional(Type.Number()),
  nodesAlloc: Type.Optional(Type.Number()),
  endTime: Type.Optional(Type.String()),
  biJobIndex: Type.Optional(Type.Number()),
  timeWait: Type.Optional(Type.Number()),
  recordTime: Type.Optional(Type.String()),
  accountPrice: Type.Optional(Money),
  tenantPrice: Type.Optional(Money),
});
export type AllJobsInfo = Static<typeof AllJobsInfo>;
