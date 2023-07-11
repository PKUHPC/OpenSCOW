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
  appJobName: string;
  userId: string;
  account: string;
  partition?: string;
  qos?: string;
  coreCount: number;
  /** in minutes */
  maxTime: number;
  customAttributes: { [key: string]: string };
  proxyBasePath: string;
  nodeCount: number;
  gpuCount?: number;
  memory?: string;
}

export type CreateAppReply = {
  sessionId: string;
  jobId: number;
}

export interface GetAppSessionsRequest {
  userId: string;
}

export interface AppSession {
  sessionId: string;
  jobId: number;
  submitTime: Date;
  appId: string;
  appName: string | undefined;
  state: string;
  dataPath: string;
  runningTime: string;
  timeLimit: string;
  reason?: string;
  host: string | undefined;
  port: number | undefined;
}

export interface GetAppSessionsReply {
  sessions: AppSession[];
}

export interface ConnectToAppRequest {
  userId: string;
  sessionId: string;
}

export type ConnectToAppReply = {
  appId: string;
  host: string;
  port: number;
  password: string;
  customFormData?: {[key: string]: string};
};

export interface SubmissionInfo {
  userId: string;
  cluster: string;
  appId: string;
  appName: string;
  account: string;
  partition?: string;
  qos?: string;
  nodeCount: number;
  coreCount: number;
  gpuCount?: number;
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

export interface AppOps {
  createApp(req: CreateAppRequest, logger: Logger): Promise<CreateAppReply>;
  listAppSessions(req: GetAppSessionsRequest, logger: Logger): Promise<GetAppSessionsReply>;
  connectToApp(req: ConnectToAppRequest, logger: Logger): Promise<ConnectToAppReply>;
  getAppLastSubmission(req: GetAppLastSubmissionRequest, logger: Logger): Promise<GetAppLastSubmissionReply>;
}
