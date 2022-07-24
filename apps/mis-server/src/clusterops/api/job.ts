import { Request } from "src/clusterops/api";
import { RunningJob } from "src/generated/common/job";

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
