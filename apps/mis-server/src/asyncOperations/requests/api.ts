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

import { Extensions, Logger } from "@ddadaal/tsgrpc-server";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";

export const AsyncOperationRequestPath = {
  GetLongRunningOperations: "api/longRunningOperations",
  CreateLongRunningOperation: "api/longRunningOperation",
  UpdateLongRunningOperation: "api/longRunningOperation",
  CompleteLongRunningOperation: "api/longRunningOperation/complete",
  GetCompletedLongRunningOperation: "api/completedLongRunningOperations",
} as const;

export type StateHandler = (
  em: SqlEntityManager<MySqlDriver>, 
  operation: Operation, 
  serverExtensions: Extensions,
) => Promise<void>;

export interface Operation {
  id: number;
  type: string;
  params: Record<string, any>;
  status: string;
  progress: Record<string, any>;
  receivedAt: string;
  updatedAt: string;
}

export interface GetLongRunningOperationsRequest {
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface GetLongRunningOperationsResponse {
  totalCount: number;
  operations: Operation[]
}

export interface CreateLongRunningOperationRequest {
  type: string;
  status: string;
  params: Record<string, any>;
  progress: Record<string, any>;
}

export interface CreateLongRunningOperationResponse {
}

export interface UpdateLongRunningOperationRequest {
  id: number;
  type?: string;
  status?: string;
  params: Record<string, any>;
  progress: Record<string, any>;
}

export type UpdateLongRunningOperationResponse = {
  id: number;
  type: string;
  status: string;
  params: Record<string, any>;
  progress: Record<string, any>;
  receivedAt: string;
  updatedAt: string;
};

export interface CompleteLongRunningOperationRequest {
  id: number;
  status: string;
  type?: string;
  params?: Record<string, any>;
  progress?: Record<string, any>;
}

export type CompleteLongRunningOperationResponse = {
  id: number;
  type: string;
  status: string;
  params: Record<string, any>;
  progress: Record<string, any>;
  receivedAt: string;
  updatedAt: string;
}

export interface GetCompletedLongRunningOperationsRequest {
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface GetCompletedLongRunningOperationsResponse {
  id: number;
  type: string;
  status: string;
  params: Record<string, any>;
  progress: Record<string, any>;
  completedAt: string;
  receivedAt: string;
  updatedAt: string;
}

export interface AsyncOperationRequests {
  getLongRunningOperations(
    req: GetLongRunningOperationsRequest, 
    logger: Logger
  ): Promise<GetLongRunningOperationsResponse>;
  createLongRunningOperation(
    req: CreateLongRunningOperationRequest, 
    logger: Logger
  ): Promise<CreateLongRunningOperationResponse>;
  updateLongRunningOperation(
    req: UpdateLongRunningOperationRequest, 
    logger: Logger
  ): Promise<UpdateLongRunningOperationResponse>;
  completeLongRunningOperation(
    req: CompleteLongRunningOperationRequest, 
    logger: Logger
  ): Promise<CompleteLongRunningOperationResponse>;
  getCompletedLongRunningOperations(
    req: GetCompletedLongRunningOperationsRequest, 
    logger: Logger
  ): Promise<GetCompletedLongRunningOperationsResponse>;
}
