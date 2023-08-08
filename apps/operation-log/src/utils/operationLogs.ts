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
import { OperationResult } from "@scow/protos/build/operation-log/operation_log";
import { OperationLog as OperationLogEntity } from "src/entities/OperationLog";

export async function logOperation(
  operatorUserId: string,
  operatorIp: string,
  operationResult: OperationResult,
  metaData: { [key: string]: any },
  em: SqlEntityManager<MySqlDriver>,
  logger: Logger,
): Promise<void> {
  try {
    const operationLogInfo: {
      operatorUserId: string,
      operatorIp: string;
      operationResult: OperationResult;
      metaData: { [key: string]: any };
    } = {
      operatorUserId,
      operatorIp,
      operationResult,
      metaData,
    };

    const operationLog = new OperationLogEntity({
      ...operationLogInfo,
    });
    await em.persistAndFlush(operationLog);
  } catch (e) {
    logger.error(e, "Failed to log operation");
  }
}
