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

import { Logger } from "@ddadaal/tsgrpc-server";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { OperationCode } from "@scow/protos/build/server/operation_log";
import { OperationLog, OperationResult } from "src/entities/OperationLog";
import { User } from "src/entities/User";

export async function logOperation(
  operatorId: string,
  operatorIp: string,
  operationCode: OperationCode,
  operationContent: string,
  operationResult: OperationResult,
  em: SqlEntityManager<MySqlDriver>,
  logger: Logger,
): Promise<void> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const user = await em.findOne(User, { userId: operatorId });
    if (!user) {
      throw new Error("User not found");
    }
    const operationLog = new OperationLog({
      operator: user,
      operatorIp,
      operationCode,
      operationContent,
      operationResult,
    });
    await em.persistAndFlush(operationLog);
  } catch (e) {
    logger.error(e, "Failed to log operation");
  }
}
