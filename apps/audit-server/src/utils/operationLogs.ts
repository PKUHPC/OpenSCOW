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

import { FilterQuery } from "@mikro-orm/core";
import {
  CreateOperationLogRequest,
  OperationLog,
  OperationLogFilter,
  operationResultFromJSON, operationResultToJSON } from "@scow/protos/build/audit/operation_log";
import { OperationLog as OperationLogEntity } from "src/entities/OperationLog";


export type OperationEvent = CreateOperationLogRequest["operationEvent"];

export async function filterOperationLogs(
  {
    operatorUserIds,
    operationResult,
    startTime,
    endTime,
    operationType,
    operationTargetAccountName,
    operationDetail,
  }: OperationLogFilter,
) {

  const sqlFilter: FilterQuery<OperationLogEntity> = {
    ...(operatorUserIds.length > 0 ? { operatorUserId: { $in: operatorUserIds } } : {}),
    $and: [
      ...(startTime ? [{ operationTime: { $gte: startTime } }] : []),
      ...(endTime ? [{ operationTime: { $lte: endTime } }] : []),
      ...((operationType) ? [{ metaData: { $case: operationType } as OperationEvent }] : []),
      ...((operationTargetAccountName) ? [{ metaData: { targetAccountName: operationTargetAccountName } }] : []),
      ...(operationDetail ? [ { metaData: { $like: `%${operationDetail}%` } }] : []),
    ],
    ...(operationResult ? { operation_result: operationResultToJSON(operationResult) } : {}),
  };
  return sqlFilter;
}

export function toGrpcOperationLog(x: OperationLogEntity): OperationLog {

  const grpcOperationLog = {
    operationLogId: x.id,
    operatorUserId: x.operatorUserId,
    operatorIp: x.operatorIp,
    operationTime: x.operationTime?.toISOString(),
    operationResult: operationResultFromJSON(x.operationResult),
    operationEvent: (x.metaData),
  };
  return grpcOperationLog;
}

/**
 * @param operationEvent
 * @returns targetAccountName
 * @description
 * 如果是导出消费记录或者导出充值记录且target是accountOfTenant，返回accountName
 * 如果是导出操作日志且source是account，返回accountName
 */
export const getTargetAccountName = (operationEvent: OperationEvent): string | undefined => {
  const operationType = operationEvent?.$case;
  if (operationType === "exportChargeRecord" || operationType === "exportPayRecord") {
    switch (operationEvent[operationType].target.$case) {
    case "accountOfTenant" :
      return operationEvent[operationType].target.accountOfTenant.accountName;
    default:
      return;
    }
  } else if (operationType === "exportOperationLog") {
    const source = operationEvent[operationType].source;
    if (source && source.$case === "account") {
      return source.account.accountName;
    }
  } else {
    return (operationEvent && operationType)
      ? operationEvent[operationType].accountName
      : undefined;
  }
};
