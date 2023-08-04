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
import { OperationLogConfigSchema } from "@scow/config/build/common";
import {
  CreateOperationLogRequest,
  OperationLogServiceClient,
  OperationResult,
} from "@scow/protos/build/operation-log/operation_log";
import { Logger } from "ts-log";

export type OperationEvent = Exclude<CreateOperationLogRequest["operationEvent"], undefined>;


export const createOperationLogClient = (
  config: OperationLogConfigSchema | undefined,
  logger: Logger | Console,
) => {
  const client = config && config.url
    ? new OperationLogServiceClient(config.url, ChannelCredentials.createInsecure())
    : undefined;

  if (config && client) {
    logger.info("Operation Log Server configured to %s", config.url);
  } else {
    logger.info("Operation Log Server disabled");
  }

  return {
    callLog: async <TName extends OperationEvent["$case"]>(
      operationUserId: string,
      operationIp: string,
      operationResult: OperationResult,
      operationTypeName: TName,
      // @ts-ignore
      operationTypePayload: (OperationEvent & { $case: TName })[TName],
      logger: Logger,
    ) => {

      if (!client) {
        logger.debug("Attempt to call Log %s with %o", operationTypeName, operationTypePayload);
        return;
      }

      logger.info("Calling log %s with %o", operationTypeName, operationTypePayload);

      return await asyncUnaryCall(client, "createOperationLog", {
        operationUserId,
        operationIp,
        operationResult,
        // @ts-ignore
        operationEvent: { $case: eventName, [eventName]: eventPayload },
      }).then(
        () => { logger.debug("Operation Log call completed"); },
        (e) => { logger.error(e, "Error when calling Operation Log"); },
      );
    },
  };
};


