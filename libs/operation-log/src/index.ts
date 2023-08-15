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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { ChannelCredentials } from "@grpc/grpc-js";
import { OperationLogConfigSchema } from "@scow/config/build/operationLog";
import {
  CreateOperationLogRequest,
  GetOperationLogsRequest,
  GetOperationLogsResponse,
  OperationLogServiceClient,
} from "@scow/protos/build/operation-log/operation_log";
import { Logger } from "ts-log";

import { OperationResult } from "./constant";

export type OperationEvent = Exclude<CreateOperationLogRequest["operationEvent"], undefined>;

export interface LogCallParams<TName extends OperationEvent["$case"]> {
  operatorUserId: string;
  operatorIp: string;
  operationTypeName: TName;
  // @ts-ignore
  operationTypePayload?: (OperationEvent & { $case: TName })[TName];
  operationResult: OperationResult;
  logger: Logger;
}

export const createOperationLogClient = (
  config: OperationLogConfigSchema | undefined,
  logger: Logger | Console,
) => {
  const client = config && config.url
    ? new OperationLogServiceClient(config.url, ChannelCredentials.createInsecure())
    : undefined;

  if (!config || !client) {
    logger.debug("Operation Log Server disabled");
  }

  return {
    getLog: async (request: GetOperationLogsRequest): Promise<GetOperationLogsResponse> => {

      if (!client) {
        logger.debug("Attempt to get Log with %o", request);
        return { results: [], totalCount: 0 };
      }

      return await asyncUnaryCall(client, "getOperationLogs", request);
    },
    callLog: async <TName extends OperationEvent["$case"]>({
      operatorUserId,
      operatorIp,
      operationTypeName,
      operationTypePayload,
      operationResult,
      logger,
    }: LogCallParams<TName>) => {

      if (!client) {
        logger.debug("Attempt to call Log %s with %o", operationTypeName, operationTypePayload);
        return;
      }

      return await asyncUnaryCall(client, "createOperationLog", {
        operatorUserId,
        operatorIp,
        operationResult,
        // @ts-ignore
        operationEvent: { $case: operationTypeName, [operationTypeName]: { ...operationTypePayload } },
      }).then(
        () => { logger.debug("Operation Log call completed"); },
        (e) => {
          logger.error(e, "Error when calling Operation Log");
        },
      );
    },
  };
};


export * from "./constant";
