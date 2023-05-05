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
  proxyBasePath: string;
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
  runningTime: string;
  timeLimit: string;
}

export interface GetAppSessionsReply {
  sessions: AppSession[];
}

export interface ConnectToAppRequest {
  userId: string;
  sessionId: string;
}

export interface SubmissionInfo {
  userId: string;
  cluster: string;
  appId: string;
  appName: string;
  account: string;
  partition?: string;
  qos?: string;
  coreCount: number;
  maxTime: number;
  submitTime?: string;
  customAttributes: { [key: string]: string };
}

export interface GetAppLastSubmissionRequest {
  userId: string;
  appId: string;
}

export type GetAppLastSubmissionReply = {
  lastSubmissionInfo?: SubmissionInfo;
}

export type ConnectToAppReply =
  | { code: "NOT_FOUND" } // sessionId is not found
  | { code: "UNAVAILABLE" } // the app is not available to connect yet
  | { code: "OK",
      appId: string;
      host: string;
      port: number;
      password: string;
      customFormData?: {[key: string]: string};
};

export interface AppOps {
  createApp(req: CreateAppRequest, logger: Logger): Promise<CreateAppReply>;
  listAppSessions(req: GetAppSessionsRequest, logger: Logger): Promise<GetAppSessionsReply>;
  connectToApp(req: ConnectToAppRequest, logger: Logger): Promise<ConnectToAppReply>;
  getAppLastSubmission(req: GetAppLastSubmissionRequest, logger: Logger): Promise<GetAppLastSubmissionReply>;
}
