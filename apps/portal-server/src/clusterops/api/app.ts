import { Logger } from "ts-log";

export interface CreateAppRequest {
  appId: string;
  userId: string;
  account: string;
  partition?: string;
  qos?: string;
  coreCount: number;
  /** in minutes */
  maxTime: number;
  customAttributes: { [key: string]: string };
}

export type CreateAppReply = {
  code: "OK";
  sessionId: string;
  jobId: number;
} | {
  code: "SBATCH_FAILED",
  message: string;
} | {
  code: "APP_NOT_FOUND";
}

export interface GetAppSessionsRequest {
  userId: string;
}

export interface AppSession {
  sessionId: string;
  jobId: number;
  submitTime: Date;
  appId: string;
  state: string;
  ready: boolean;
  dataPath: string;
}

export interface GetAppSessionsReply {
  sessions: AppSession[];
}

export interface ConnectToAppRequest {
  userId: string;
  sessionId: string;
}

export type ConnectToAppReply =
  | { code: "NOT_FOUND" } // sessionId is not found
  | { code: "UNAVAILABLE" } // the app is not available to connect yet
  | { code: "OK",
      appId: string;
      host: string;
      port: number;
      password: string;
};

export interface AppOps {
  createApp(req: CreateAppRequest, logger: Logger): Promise<CreateAppReply>;
  listAppSessions(req: GetAppSessionsRequest, logger: Logger): Promise<GetAppSessionsReply>;
  connectToApp(req: ConnectToAppRequest, logger: Logger): Promise<ConnectToAppReply>;
}
