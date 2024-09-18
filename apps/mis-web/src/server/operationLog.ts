/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { createOperationLogClient,
  LogCallParams, OperationEvent, OperationResult } from "@scow/lib-operation-log/build/index";
import { runtimeConfig } from "src/utils/config";

interface PartialLogCallParams<TName extends OperationEvent["$case"]>
  extends Omit<LogCallParams<TName>, "operationResult" | "logger"> {}

export const callLog = async <TName extends OperationEvent["$case"]>(
  {
    operatorUserId,
    operatorIp,
    operationTypeName,
    operationTypePayload,
  }: PartialLogCallParams<TName>,
  operationResult: OperationResult,
) => {

  const { callLog } = createOperationLogClient(runtimeConfig.AUDIT_CONFIG, console);

  await callLog(
    {
      operatorUserId,
      operatorIp,
      operationTypeName,
      operationTypePayload,
      operationResult,
      logger: console,
    },
  );
};

