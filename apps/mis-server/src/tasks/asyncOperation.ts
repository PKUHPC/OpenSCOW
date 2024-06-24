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
import { getAsyncOperationStateMachineForType } from "src/asyncOperations/handlers";
import { asyncOperationRequests } from "src/asyncOperations/requests";
import { misConfig } from "src/config/mis";

export const lastExec: Date | null = null;


export async function execAsyncOperation(
  em: SqlEntityManager<MySqlDriver>,
  logger: Logger,
  serverExtensions: Extensions,
) {
  const config = misConfig.asyncOperation;
  if (!config) {
    logger.info("No asyncOperation related configuration.");
    return;
  }
  // 1. 获取异步操作列表
  const operationData = await asyncOperationRequests?.getLongRunningOperations({}, logger);

  // 2. 处理所有操作
  operationData?.operations.forEach(async (operation) => {
    const stateMachine = getAsyncOperationStateMachineForType(operation.type);
    await stateMachine.handleAsyncOperation(em, operation, serverExtensions);
  });
}