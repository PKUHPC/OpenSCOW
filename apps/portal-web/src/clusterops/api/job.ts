import { RunningJob } from "src/generated/common/job";
import { ServerLogger } from "src/utils/log.server";

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

/** UNAVAILABLE: if sbatch fails, the details is the stderr */
export interface SubmitJobReply {
  jobId: number;
}

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
  submitTime: Date;
  comment: string | undefined;
}

export interface GetSavedJobsReply {
  results: SavedJob[];
}

export interface GetSavedJobRequest {
  userId: string;
  id: string;
}

export interface GetSavedJobReply {
  jobInfo?: NewJobInfo;
}

export interface CancelJobRequest {
  userId: string;
  jobId: number;
}

export interface CancelJobReply {}

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
  getRunningJobs(req: GetRunningJobsRequest, logger: ServerLogger): Promise<GetRunningJobsReply>;
  getAccounts(req: GetAccountsRequest, logger: ServerLogger): Promise<GetAccountsReply>;
  generateJobScript(req: GenerateJobScriptRequest, logger: ServerLogger): Promise<GenerateJobScriptReply>;
  submitJob(req: SubmitJobRequest, logger: ServerLogger): Promise<SubmitJobReply>;
  getSavedJobs(req: GetSavedJobsRequest, logger: ServerLogger): Promise<GetSavedJobsReply>;
  getSavedJob(req: GetSavedJobRequest, logger: ServerLogger): Promise<GetSavedJobReply>;
  cancelJob(req: CancelJobRequest, logger: ServerLogger): Promise<CancelJobReply>;
  getAllJobsInfo(req: GetAllJobsInfoRequest, logger: ServerLogger): Promise<GetAllJobsInfoReply>;
}
