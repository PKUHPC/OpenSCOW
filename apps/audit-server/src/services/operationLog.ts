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

import { ensureNotUndefined, plugin } from "@ddadaal/tsgrpc-server";
import { QueryOrder } from "@mikro-orm/core";
import {
  OperationLogServiceServer,
  OperationLogServiceService,
  operationResultToJSON,
} from "@scow/protos/build/audit/operation_log";
import { OperationLog, OperationResult } from "src/entities/OperationLog";
import { filterOperationLogs, toGrpcOperationLog } from "src/utils/operationLogs";
import { DEFAULT_PAGE_SIZE, paginationProps } from "src/utils/orm";


export const operationLogServiceServer = plugin((server) => {

  server.addService<OperationLogServiceServer>(OperationLogServiceService, {

    createOperationLog: async ({ request, em }) => {
      const {
        operatorUserId,
        operatorIp,
        operationResult,
        operationEvent,
      } = request;

      const metaData = operationEvent || {};
      const operationType = operationEvent?.$case;
      const targetAccountName = (operationEvent && operationType)
        ? operationEvent[operationType].accountName
        : undefined;

      const dbOperationResult: OperationResult = OperationResult[operationResultToJSON(operationResult)];

      const operationLog = new OperationLog({
        operatorUserId,
        operatorIp,
        operationResult: dbOperationResult,
        metaData: { ...metaData, targetAccountName },
      });
      await em.persistAndFlush(operationLog);
      return [];
    },

    getOperationLogs: async ({ request, em, logger }) => {
      const { filter, page, pageSize } = ensureNotUndefined(request, ["filter", "page"]);

      const sqlFilter = await filterOperationLogs(filter);

      logger.info("getOperationLogs sqlFilter %s", JSON.stringify(sqlFilter));

      const [operationLogs, count] = await em.findAndCount(OperationLog, sqlFilter, {
        ...paginationProps(page, pageSize || DEFAULT_PAGE_SIZE),
        orderBy: { operationTime: QueryOrder.DESC },
      });

      const res = operationLogs.map(toGrpcOperationLog);

      return [{
        results: res,
        totalCount: count,
      }];
    },

  });

});
