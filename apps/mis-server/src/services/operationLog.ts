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
import { FilterQuery, QueryOrder } from "@mikro-orm/core";
import {
  OperationLogServiceServer,
  OperationLogServiceService,
} from "@scow/protos/build/server/operation_log";
import { OperationLog as OperationLogEntity } from "src/entities/OperationLog";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { filterOperationLogs, logOperation, NewOperationLogFilter, toGrpcOperationLog } from "src/utils/operationLog";
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

      // 如果有特定tenant，只能查看该tenant的日志。获取该tenant下的所有用户userId作为operatorUserIds
      const { operatorUserIds, operationTargetTenantName } = filter;
      const operators = await em.find(User, { userId: { $in: operatorUserIds } });

      const newFilter = { ...filter, operatorIds: operators.map((x) => x.id) } as NewOperationLogFilter;
      let sqlFilter: FilterQuery<OperationLogEntity>;
      if (operationTargetTenantName) {

        const tenant = await em.findOne(Tenant, { name: operationTargetTenantName });

        if (!tenant) {
          throw new Error(`tenant ${operationTargetTenantName} not found`);
        }
        const users = await em.find(User, { tenant });
        if (operatorUserIds.length > 0) {
          users.filter((x) => operatorUserIds.includes(x.userId));
          sqlFilter = filterOperationLogs({ ...filter, operatorIds: users.map((x) => x.id) });
        } else {
          // 如果没有传特定操作者，就默认是该tenant下的所有用户
          sqlFilter = filterOperationLogs({ ...filter, operatorIds: users.map((x) => x.id) });
        }
      }
      sqlFilter = filterOperationLogs(newFilter);

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
