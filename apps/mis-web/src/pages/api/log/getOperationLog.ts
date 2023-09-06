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

import { typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { createOperationLogClient } from "@scow/lib-operation-log/build/index";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getOperationDetail, OperationCodeMap, OperationLog, OperationLogQueryType,
  OperationResult, OperationType } from "src/models/operationLog";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { runtimeConfig } from "src/utils/config";



export const GetOperationLogFilter = Type.Object({

  operatorUserIds: Type.String(),

  /**
   * @format date-time
   */
  startTime: Type.Optional(Type.String({ format: "date-time" })),

  /**
   * @format date-time
   */
  endTime: Type.Optional(Type.String({ format: "date-time" })),

  operationType: Type.Optional(Type.Enum(OperationType)),
  operationResult: Type.Optional(Type.Enum(OperationResult)),

  operationTargetAccountName: Type.Optional(Type.String()),
});

export type GetOperationLogFilter = Static<typeof GetOperationLogFilter>;


export const GetOperationLogsSchema = typeboxRouteSchema({

  method: "GET",

  query: Type.Object({

    type: Type.Enum(OperationLogQueryType),

    ...GetOperationLogFilter.properties,
    /**
     * @minimum 1
     * @type integer
     */
    page: Type.Integer({ minimum: 1 }),

    /**
     * @type integer
     */
    pageSize: Type.Optional(Type.Integer()),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(OperationLog),
      totalCount: Type.Number(),
    }),


    403: Type.Null(),
  },
});

export default typeboxRoute(GetOperationLogsSchema, async (req, res) => {
  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const {
    type, operatorUserIds, startTime, endTime,
    operationType, operationResult, operationTargetAccountName, page, pageSize } = req.query;

  const filter = {
    operatorUserIds: operatorUserIds ? operatorUserIds.split(",") : [],
    startTime, endTime, operationType,
    operationResult, operationTargetAccountName,
  };
  // 用户请求
  if (type === OperationLogQueryType.USER) {
    filter.operatorUserIds = [info.identityId];
  }

  if (type === OperationLogQueryType.ACCOUNT) {
    if (!filter.operationTargetAccountName) {
      return { 400: null };
    }

    // 确认用户是账户管理员或者拥有者
    if (
      !info.accountAffiliations
        .find((au) => au.accountName === filter.operationTargetAccountName
      && (au.role === UserRole.ADMIN || au.role === UserRole.OWNER))
    ) {
      return { 403: null };
    }
  };

  if (type === OperationLogQueryType.TENANT) {
    if (!info.tenantRoles.includes(TenantRole.TENANT_ADMIN)) {
      return { 403: null };
    }
    // 查看该租户下所有用户的操作日志
    const client = getClient(UserServiceClient);
    const { users } = await asyncClientCall(client, "getUsers", {
      tenantName: info.tenant,
    });

    // 搜索条件中的userId必须是属于该tenant的
    filter.operatorUserIds = filter.operatorUserIds.length === 0
      ? users.map((u) => u.userId)
      : filter.operatorUserIds.filter((id) => users.find((u) => u.userId === id));
  };

  if (type === OperationLogQueryType.PLATFORM) {
    if (!info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)) {
      return { 403: null };
    }
  }
  const { getLog } = createOperationLogClient(runtimeConfig.AUDIT_CONFIG, console);
  const resp = await getLog({ filter, page, pageSize });

  const { results, totalCount } = resp;

  const userIds = Array.from(new Set(results.map((x) => x.operatorUserId)));

  const client = getClient(UserServiceClient);
  const { users } = await asyncClientCall(client, "getUsersByIds", {
    userIds,
  });

  const userMap = new Map(users.map((x) => [x.userId, x.userName]));

  const operationLogs = results.map((x) => {
    return {
      operationLogId: x.operationLogId,
      operatorUserId: x.operatorUserId,
      operatorUserName: userMap.get(x.operatorUserId),
      operatorIp: x.operatorIp,
      operationResult: x.operationResult,
      operationTime: x.operationTime,
      operationType: x.operationEvent?.["$case"] || "unknown",
      operationCode: x.operationEvent?.["$case"] ? OperationCodeMap[x.operationEvent?.["$case"]] : "000000",
      operationDetail: getOperationDetail(x),
    };
  });
  return {
    200: { results: operationLogs as OperationLog[], totalCount },
  };
});
