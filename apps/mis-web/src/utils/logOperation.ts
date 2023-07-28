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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { OperationLog, OperationLogServiceClient, OperationResult } from "@scow/protos/build/server/operation_log";
import { getClient } from "src/utils/client";

export const logOperation = (logInfo: Omit<OperationLog, "operationResult">, isOperationSuccess: boolean) => {
  const logClient = getClient(OperationLogServiceClient);

  asyncClientCall(logClient, "createOperationLog", {
    ...logInfo,
    operationResult: isOperationSuccess ? OperationResult.SUCCESS : OperationResult.FAIL,
  });
};
