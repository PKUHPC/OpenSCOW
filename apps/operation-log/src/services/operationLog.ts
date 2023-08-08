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

import { plugin } from "@ddadaal/tsgrpc-server";
import {
  OperationLogServiceServer,
  OperationLogServiceService,
} from "@scow/protos/build/operation-log/operation_log";
import { logOperation } from "src/utils/operationLogs";


export const operationLogServiceServer = plugin((server) => {

  server.addService<OperationLogServiceServer>(OperationLogServiceService, {

    createOperationLog: async ({ request, em, logger }) => {
      const {
        operatorUserId,
        operatorIp,
        operationResult,
        operationEvent,
      } = request;

      const eventName = operationEvent ? operationEvent["$case"] : null;
      const metaData = eventName ? { [eventName]: operationEvent?.[eventName] || {} } : {};

      await logOperation(
        operatorUserId, operatorIp,
        operationResult, metaData, em, logger,
      );
      return [];
    },

    getOperationLogs: async ({}) => {
      // const { filter, page, pageSize } = ensureNotUndefined(request, ["filter"]);

      // const newFilter = { ...filter, operatorIds: operators.map((x) => x.id) } as NewOperationLogFilter;
      // let sqlFilter: FilterQuery<OperationLog>;


      // sqlFilter = filterOperationLogs(newFilter);

      // logger.info("getOperationLogs sqlFilter %s", JSON.stringify(sqlFilter));

      // const [operationLogs, count] = await em.findAndCount(OperationLog, sqlFilter, {
      //   ...paginationProps(page, pageSize || 10),
      //   orderBy: { operationTime: QueryOrder.DESC },
      // });

      // return [{
      //   results: operationLogs.map(toGrpcOperationLog),
      //   totalCount: count,
      // }];
      return [];
    },

  });

});
