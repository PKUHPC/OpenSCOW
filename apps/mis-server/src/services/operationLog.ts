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
} from "@scow/protos/build/server/operation_log";
import { OperationLog as OperationLogEntity } from "src/entities/OperationLog";
import { filterOperationLogs, logOperation, toGrpcOperationLog } from "src/utils/operationLog";
import { paginationProps } from "src/utils/orm";


export const operationLogServiceServer = plugin((server) => {

  server.addService<OperationLogServiceServer>(OperationLogServiceService, {

    createOperationLog: async ({ request, em, logger }) => {
      const { operatorUserId,
        operatorIp,
        operationCode,
        operationType,
        operationContent,
        operationResult,
        operationTargetAccountName,
      } = request;

      await logOperation(
        operatorUserId, operatorIp, operationCode,
        operationType, operationContent,
        operationResult, operationTargetAccountName, em, logger,
      );

    },

    getOperationLogs: async ({ request, em, logger }) => {
      const { filter, page, pageSize } = ensureNotUndefined(request, ["filter"]);
      const sqlFilter = filterOperationLogs(filter);

      logger.info("getOperationLogs sqlFilter %s", JSON.stringify(sqlFilter));

      const [operationLogs, count] = await em.findAndCount(OperationLogEntity, sqlFilter, {
        ...paginationProps(page, pageSize || 10),
        orderBy: { operationTime: QueryOrder.DESC },
        populate: ["operator"],
      });

      return [{
        results: operationLogs.map(toGrpcOperationLog),
        totalCount: count,
      }];
    },

  });

});
