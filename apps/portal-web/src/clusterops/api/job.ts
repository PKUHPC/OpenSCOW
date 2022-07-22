import { RunningJob } from "src/generated/common/job";
import { Logger } from "src/utils/log";

export interface GetRunningJobsRequest {
  userId: string;
}

export interface GetRunningJobsReply {
  jobs: RunningJob[];
}

export interface SubmitJobRequest {
  userId: string;
  jobInfo: NewJobInfo;
  script: string;
  save: boolean;
}

export type SubmitJobReply = 
  | { code: "OK", jobId: number; }
  | { code: "SBATCH_FAILED", message: string };

export interface NewJobInfo {
  jobName: string;
  account: string;
  partition?: string | undefined;
  qos?: string | undefined;
  nodeCount: number;
  coreCount: number;
  /** in minutes */
  maxTime: number;
  command: string;
  workingDirectory: string;
  comment?: string | undefined;
}

export interface GenerateJobScriptRequest {
  jobInfo: NewJobInfo;
}

export interface GenerateJobScriptReply {
  script: string;
}

export interface GetAccountsRequest {
  userId: string;
}

export interface GetAccountsReply {
  accounts: string[];
}

export interface GetSavedJobsRequest {
  userId: string;
}

export interface SavedJob {
  id: string;
  jobName: string;
  submitTime: string;
  comment: string | undefined;
}

export interface GetSavedJobsReply {
  results: SavedJob[];
}

export interface GetSavedJobRequest {
  userId: string;
  id: string;
}

export type GetSavedJobReply = {
  code: "OK"
  jobInfo: NewJobInfo;
} | { 
  code: "NOT_FOUND"
}

export interface CancelJobRequest {
  userId: string;
  jobId: number;
}

export type CancelJobReply = { code: "OK" } | { code: "NOT_FOUND" };

export interface GetAllJobsInfoRequest {
  userId: string;
  startTime: Date;
  endTime: Date;
}

export interface JobInfo {
  jobId: string;
  name: string;
  account: string;
  partition: string;
  qos: string;
  state: string;
  workingDir: string;
  reason: string;
  elapsed: string;
  timeLimit: string;
  submitTime: string;
}

export interface GetAllJobsInfoReply {
  jobs: JobInfo[];
}

export interface JobOps {
  getRunningJobs(req: GetRunningJobsRequest, logger: Logger): Promise<GetRunningJobsReply>;
  getAccounts(req: GetAccountsRequest, logger: Logger): Promise<GetAccountsReply>;
  generateJobScript(req: GenerateJobScriptRequest, logger: Logger): Promise<GenerateJobScriptReply>;
  submitJob(req: SubmitJobRequest, logger: Logger): Promise<SubmitJobReply>;
  getSavedJobs(req: GetSavedJobsRequest, logger: Logger): Promise<GetSavedJobsReply>;
  getSavedJob(req: GetSavedJobRequest, logger: Logger): Promise<GetSavedJobReply>;
  cancelJob(req: CancelJobRequest, logger: Logger): Promise<CancelJobReply>;
  getAllJobsInfo(req: GetAllJobsInfoRequest, logger: Logger): Promise<GetAllJobsInfoReply>;
}
