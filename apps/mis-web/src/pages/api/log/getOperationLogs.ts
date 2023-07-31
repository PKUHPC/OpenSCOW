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
import { GetOperationLogsRequest, OperationLogServiceClient } from "@scow/protos/build/server/operation_log";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationCode, OperationLogQueryType, OperationResult, OperationType } from "src/models/operationLogModal";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";


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

  operationCode: Type.Optional(Type.Enum(OperationCode)),
  operationType: Type.Optional(Type.Enum(OperationType)),
  operationResult: Type.Optional(Type.Enum(OperationResult)),

  operationTargetAccountName: Type.Optional(Type.String()),
  operationTargetTenantName: Type.Optional(Type.String()),
});

export type GetOperationLogFilter = Static<typeof GetOperationLogFilter>;

// Cannot use OperationLog from protos
export const OperationLog = Type.Object({
  operatorUserId: Type.String(),
  operatorIp: Type.String(),
  operationCode: Type.Enum(OperationCode),
  operationType: Type.Enum(OperationType),
  operationContent: Type.String(),
  operationResult: Type.Enum(OperationResult),
  operationTime: Type.Optional(Type.String()),

});
export type OperationLog = Static<typeof OperationLog>;

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

export const getOperationLogs = async (request: GetOperationLogsRequest) => {

  const client = getClient(OperationLogServiceClient);

  const reply = await asyncClientCall(client, "getOperationLogs", request);

  return reply;
};


export default typeboxRoute(GetOperationLogsSchema, async (req, res) => {
  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const {
    type, operatorUserIds, startTime, endTime, operationCode,
    operationType, operationResult, operationTargetAccountName,
    operationTargetTenantName, page, pageSize } = req.query;

  const filter = {
    operatorUserIds: operatorUserIds.split(","),
    startTime, endTime,
    operationCode, operationType,
    operationResult, operationTargetAccountName,
    operationTargetTenantName,
  };
  // 用户请求
  if (type === OperationLogQueryType.USER) {
    filter.operatorUserIds = [info.identityId];
  }

  if (type === OperationLogQueryType.ACCOUNT) {
    if (!filter.operationTargetAccountName) {
      return { 400: null };
    }
    // 确认用户是账户管理员
    if (!info.accountAffiliations.includes({
      accountName: filter.operationTargetAccountName, role: UserRole.ADMIN,
    })) {
      return { 403: null };
    }
  };

  if (type === OperationLogQueryType.TENANT) {
    if (!info.tenantRoles.includes(TenantRole.TENANT_ADMIN)) {
      return { 403: null };
    }
    filter.operationTargetTenantName = info.tenant;
  };

  if (type === OperationLogQueryType.PLATFORM) {
    if (!info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)) {
      return { 403: null };
    }
  }

  const results = await getOperationLogs({ filter, page, pageSize });

  return {
    200: { results: results.results, totalCount: results.totalCount },
  };
});
