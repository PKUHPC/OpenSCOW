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
} from "@scow/protos/build/operation-log/operation_log";
import { OperationLog } from "src/entities/OperationLog";
import { filterOperationLogs, logOperation, toGrpcOperationLog } from "src/utils/operationLogs";
import { paginationProps } from "src/utils/orm";


export const operationLogServiceServer = plugin((server) => {

  server.addService<OperationLogServiceServer>(OperationLogServiceService, {

    createOperationLog: async ({ request, em, logger }) => {
      const {
        operatorUserId,
        operatorIp,
        operationResult,
        operationEvent,
      } = request;

      const metaData = operationEvent || {};
      await logOperation(
        operatorUserId, operatorIp,
        operationResult, metaData, em, logger,
      );
      return [];
    },

    getOperationLogs: async ({ request, em, logger }) => {
      const { filter, page, pageSize } = ensureNotUndefined(request, ["filter", "page"]);

      const sqlFilter = await filterOperationLogs(filter);

      logger.info("getOperationLogs sqlFilter %s", JSON.stringify(sqlFilter));

      const [operationLogs, count] = await em.findAndCount(OperationLog, sqlFilter, {
        ...paginationProps(page, pageSize || 10),
        orderBy: { operationTime: QueryOrder.DESC },
      });

      return [{
        results: operationLogs.map(toGrpcOperationLog),
        totalCount: count,
      }];
    },

  });

});
