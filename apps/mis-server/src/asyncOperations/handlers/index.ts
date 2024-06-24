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

import { CreateAccountHandlersName, getCreateAccountHandles } from "src/asyncOperations/handlers/createAccount";
import { StateHandler } from "src/asyncOperations/requests/api";
import { AsyncOperationStateMachine } from "src/utils/asyncOperation";

export const handlersMap = new Map<string, Map<string, StateHandler>>();

export const operationStatus = {
  SUCCESS: "success",
  FAILED: "failed",
  PARTIAL_SUCCESS: "partial_success",
} as const;

// 状态机实例工厂
export function getAsyncOperationStateMachineForType(type: string) {
  const handlers = handlersMap.get(type);
  if (handlers) {
    return new AsyncOperationStateMachine(handlers);
  } else {
    throw new Error(`No async operation handlers defined for async operation type: ${type}`);
  }
}

export function initAsyncOperationHandler() {
  handlersMap.set(CreateAccountHandlersName, getCreateAccountHandles());
}
