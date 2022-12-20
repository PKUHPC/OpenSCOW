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
import { Request } from "src/clusterops/api";

export interface GetRunningJobsRequest {
  userId?: string | undefined;
  accountNames: string[];
  jobIdList: string[];
}

export interface GetRunningJobsReply {
  jobs: RunningJob[];
}

export interface ChangeJobTimeLimitRequest {
  jobId: string;
  /** 单位：分钟 */
  delta: number;
}

/** NOT_FOUND: if job_id is not found. */
export type ChangeJobTimeLimitReply =
  | { code: "NOT_FOUND"}
  | { code: "OK" };

export interface QueryJobTimeLimitRequest {
  jobId: string;
}

/** NOT_FOUND: if job_id is not found */
export type QueryJobTimeLimitReply =
  | { code: "NOT_FOUND"}
  | {
    code: "OK",
    // 单位秒
    limit: number;
};

export interface JobOps {
  getRunningJobs(req: Request<GetRunningJobsRequest>): Promise<GetRunningJobsReply>;
  changeJobTimeLimit(req: Request<ChangeJobTimeLimitRequest>): Promise<ChangeJobTimeLimitReply>;
  queryJobTimeLimit(req: Request<QueryJobTimeLimitRequest>): Promise<QueryJobTimeLimitReply>;
}
