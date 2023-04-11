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
import { Logger } from "ts-log";

export interface ListRunningJobsRequest {
  userId: string;
}

export interface ListRunningJobsReply {
  results: RunningJob[];
}

export interface SubmitJobRequest {
  userId: string;
  jobInfo: JobTemplate;
  script: string;
  saveAsTemplate: boolean;
}

export type SubmitJobReply =
  | { code: "OK", jobId: number; }
  | { code: "SBATCH_FAILED", message: string };

export interface JobTemplate {
  jobName: string;
  account: string;
  partition?: string | undefined;
  qos?: string | undefined;
  nodeCount: number;
  coreCount: number;
  gpuCount?: number;
  /** in minutes */
  maxTime: number;
  command: string;
  workingDirectory: string;
  output?: string;
  errorOutput?: string;
  memory?: string;
  comment?: string | undefined;
}

export interface GenerateJobScriptRequest {
  jobInfo: JobTemplate;
}

export interface GenerateJobScriptReply {
  script: string;
}

export interface ListAccountsRequest {
  userId: string;
}

export interface ListAccountsReply {
  accounts: string[];
}

export interface ListJobTemplatesRequest {
  userId: string;
}

export interface JobTemplateInfo {
  id: string;
  jobName: string;
  submitTime: Date;
  comment: string | undefined;
}

export interface ListJobTemplatesReply {
  results: JobTemplateInfo[];
}

export interface GetJobTemplateRequest {
  userId: string;
  id: string;
}

export type GetJobTemplateReply = {
  code: "OK"
  template: JobTemplate;
} | {
  code: "NOT_FOUND"
}

export interface CancelJobRequest {
  userId: string;
  jobId: number;
}

export type CancelJobReply = { code: "OK" } | { code: "NOT_FOUND" };

export interface ListAllJobsInfoRequest {
  userId: string;
  startTime?: Date;
  endTime?: Date;
}

export interface JobInfo {
  jobId: number;
  name: string;
  account: string;
  partition: string;
  qos: string;
  state: string;
  workingDirectory: string;
  reason: string;
  elapsed: string;
  timeLimit: string;
  submitTime: string;
  startTime: string;
  endTime: string;
}

export interface ListAllJobsInfoReply {
  results: JobInfo[];
}

export interface JobOps {
  listRunningJobs(req: ListRunningJobsRequest, logger: Logger): Promise<ListRunningJobsReply>;
  listAccounts(req: ListAccountsRequest, logger: Logger): Promise<ListAccountsReply>;
  generateJobScript(req: GenerateJobScriptRequest, logger: Logger): Promise<GenerateJobScriptReply>;
  submitJob(req: SubmitJobRequest, logger: Logger): Promise<SubmitJobReply>;
  listJobTemplates(req: ListJobTemplatesRequest, logger: Logger): Promise<ListJobTemplatesReply>;
  getJobTamplate(req: GetJobTemplateRequest, logger: Logger): Promise<GetJobTemplateReply>;
  cancelJob(req: CancelJobRequest, logger: Logger): Promise<CancelJobReply>;
  listAllJobsInfo(req: ListAllJobsInfoRequest, logger: Logger): Promise<ListAllJobsInfoReply>;
}
