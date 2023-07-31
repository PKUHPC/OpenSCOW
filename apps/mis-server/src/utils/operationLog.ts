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
import { FilterQuery } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import {
  OperationCode,
  OperationLog,
  OperationLogFilter,
  OperationType,
} from "@scow/protos/build/server/operation_log";
import { Account } from "src/entities/Account";
import { OperationLog as OperationLogEntity, OperationResult } from "src/entities/OperationLog";
import { User } from "src/entities/User";

export function filterOperationLogs({
  operatorUserIds,
  startTime,
  endTime,
  operationCode,
  operationType,
  operationResult,
}: OperationLogFilter) {
  const sqlFilter: FilterQuery<OperationLogEntity> = {
    ...(operatorUserIds.length > 0 ? { operator_user_id: { $in: operatorUserIds } } : {}),
    $and: [
      ...(startTime ? [{ operationTime: { $gte: startTime } }] : []),
      ...(endTime ? [{ operationTime: { $lte: endTime } }] : []),
    ],
    ...(operationCode ? { operation_code: operationCode } : {}),
    ...(operationType ? { operation_type: operationType } : {}),
    ...(operationResult ? { operation_result: operationResult } : {}),
  };

  return sqlFilter;
}

export function toGrpcOperationLog(x: OperationLogEntity): OperationLog {
  const operator = x.operator.unwrap();
  return {
    operatorUserId: operator.userId.toString(),
    operatorIp: x.operatorIp,
    operationTime: x.operationTime?.toISOString(),
    operationCode: x.operationCode,
    operationType: x.operationType,
    operationContent: x.operationContent,
    operationResult: x.operationResult,
  };
}

export async function logOperation(
  operatorUserId: string,
  operatorIp: string,
  operationCode: OperationCode,
  operationType: OperationType,
  operationContent: string,
  operationResult: OperationResult,
  operationTargetAccountName: string | undefined,
  em: SqlEntityManager<MySqlDriver>,
  logger: Logger,
): Promise<void> {
  try {

    const user = await em.findOne(User, { userId: operatorUserId });
    if (!user) {
      throw new Error("User not found");
    }
    const operationLogInfo: {
      operator: User;
      operatorIp: string;
      operationCode: OperationCode;
      operationType: OperationType;
      operationContent: string;
      operationResult: OperationResult;
      operationTargetAccount?: Account;
    } = {
      operator: user,
      operatorIp,
      operationCode,
      operationType,
      operationContent,
      operationResult,
      operationTargetAccount: undefined,
    };
    if (operationTargetAccountName) {
      const targetAccount = await em.findOne(Account, { accountName: operationTargetAccountName });
      if (!targetAccount) {
        throw new Error("Target account not found");
      }
      operationLogInfo.operationTargetAccount = targetAccount;
    }

    const operationLog = new OperationLogEntity({
      ...operationLogInfo,
    });
    await em.persistAndFlush(operationLog);
  } catch (e) {
    logger.error(e, "Failed to log operation");
  }
}
