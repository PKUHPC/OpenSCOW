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
  OperationLog,
  OperationLogFilter,
  operationResultFromJSON, operationResultToJSON } from "@scow/protos/build/operation-log/operation_log";
import { OperationLog as OperationLogEntity } from "src/entities/OperationLog";


export async function filterOperationLogs(
  {
    operatorUserIds,
    operationResult,
    startTime,
    endTime,
    operationType,
    operationTargetAccountName,
  }: OperationLogFilter,
) {

  const sqlFilter: FilterQuery<OperationLogEntity> = {
    ...(operatorUserIds.length > 0 ? { operatorUserId: { $in: operatorUserIds } } : {}),
    $and: [
      ...(startTime ? [{ operationTime: { $gte: startTime } }] : []),
      ...(endTime ? [{ operationTime: { $lte: endTime } }] : []),
    ],
    ...(operationType || operationTargetAccountName ? {
      metaData: {
        ...((operationType) ? { $case: operationType } : {}),
        ...((operationTargetAccountName) ? { targetAccountName: operationTargetAccountName } : {}),
      },
    } : {}),
    ...(operationResult ? { operation_result: operationResultToJSON(operationResult) } : {}),
  };
  return sqlFilter;
}

export function toGrpcOperationLog(x: OperationLogEntity): OperationLog {

  const grpcOperationLog = {
    operatorUserId: x.operatorUserId,
    operatorIp: x.operatorIp,
    operationTime: x.operationTime?.toISOString(),
    operationResult: operationResultFromJSON(x.operationResult),
  };
  if (x.metaData && x.metaData.$case) {
    // @ts-ignore
    grpcOperationLog.operationEvent = {
      $case: x.metaData.$case,
      [x.metaData.$case]: x.metaData[x.metaData.$case],
    };

  }

  return grpcOperationLog;
}
