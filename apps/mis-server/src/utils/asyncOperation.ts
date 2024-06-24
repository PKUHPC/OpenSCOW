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

import { Extensions } from "@ddadaal/tsgrpc-server";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { Operation, StateHandler } from "src/asyncOperations/requests/api";
import { logger } from "src/utils/logger";

export class AsyncOperationStateMachine {
  private handlers: Map<string, StateHandler>;

  constructor(handlers: Map<string, StateHandler>) {
    this.handlers = handlers;
  }

  public async handleAsyncOperation(
    em: SqlEntityManager<MySqlDriver>, 
    operation: Operation, 
    serverExtensions: Extensions,
  ) {
    const handler = this.handlers.get(operation.status);
    if (handler) {
      await handler(em, operation, serverExtensions);
    } else {
      // 异步操作不由 mis-server 处理，直接忽略
      logger.info(`No async operation handler found for type: ${operation.type}, status: ${operation.status}`);
    }
  }
}
