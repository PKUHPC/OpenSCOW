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
import { createOperationLogClient } from "@scow/lib-operation-log";
import { OperationLog as OperationLogProto } from "@scow/protos/build/operation-log/operation_log";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationCodeMap, OperationLog, OperationLogQueryType, OperationResult,
  OperationType } from "src/models/operationLog";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { runtimeConfig } from "src/utils/config";
import { moneyToString } from "src/utils/money";

const getOperationDetail = (operationLog: OperationLogProto) => {

  try {
    const { operationEvent } = operationLog;
    if (!operationEvent) {
      return "";
    }
    const logEvent = operationEvent.$case;
    const logPayload = operationEvent[logEvent];
    switch (logEvent) {
    case OperationType.LOGIN:
      return "用户登录";
    case OperationType.LOGOUT:
      return "用户退出登录";
    case OperationType.SUBMIT_JOB:
      return `在账户${logPayload.accountName}下提交作业(ID: ${logPayload.jobId})`;
    case OperationType.END_JOB:
      return `结束作业(ID: ${logPayload.jobId}`;
    case OperationType.ADD_JOB_TEMPLATE:
      return `保存作业模板(模板名: ${logPayload.jobTemplateId})`;
    case OperationType.DELETE_JOB_TEMPLATE:
      return `删除作业模板(模板名：${logPayload.jobTemplateId})`;
    case OperationType.UPDATE_JOB_TEMPLATE:
      return `更新作业模板(旧模板名：${logPayload.jobTemplateId}，新模板名：${logPayload.newJobTemplateId})`;
    case OperationType.SHELL_LOGIN:
      return `登录${logPayload.clusterId}集群的${logPayload.loginNode}节点`;
    case OperationType.CREATE_DESKTOP:
      return `新建桌面(桌面名：${logPayload.desktopName}, 桌面类型: ${logPayload.wm})`;
    case OperationType.DELETE_DESKTOP:
      return `删除桌面(桌面ID: ${logPayload.loginNode}:${logPayload.desktopId})`;
    case OperationType.CREATE_APP:
      return `在账户${logPayload.accountName}下创建应用(ID: ${logPayload.jobId})`;
    case OperationType.CREATE_FILE:
      return `新建文件：${logPayload.path}`;
    case OperationType.DELETE_FILE:
      return `删除文件：${logPayload.path}`;
    case OperationType.UPLOAD_FILE:
      return `上传文件：${logPayload.path}`;
    case OperationType.CREATE_DIRECTORY:
      return `新建文件夹：${logPayload.path}`;
    case OperationType.DELETE_DIRECTORY:
      return `删除文件夹：${logPayload.path}`;
    case OperationType.MOVE_FILE_ITEM:
      return `移动文件/文件夹：${logPayload.fromPath}至${logPayload.toPath}`;
    case OperationType.COPY_FILE_ITEM:
      return `复制文件/文件夹：${logPayload.fromPath}至${logPayload.toPath}`;
    case OperationType.ADD_USER_TO_ACCOUNT:
      return `将用户${logPayload.userId}添加到账户${logPayload.accountName}中`;
    case OperationType.REMOVE_USER_FROM_ACCOUNT:
      return `将用户${logPayload.userId}从账户${logPayload.accountName}中移除`;
    case OperationType.SET_ACCOUNT_ADMIN:
      return `设置用户${logPayload.userId}为账户${logPayload.accountName}的管理员`;
    case OperationType.UNSET_ACCOUNT_ADMIN:
      return `取消用户${logPayload.userId}为账户${logPayload.accountName}的管理员`;
    case OperationType.BLOCK_USER:
      return `在账户${logPayload.accountName}中封锁用户${logPayload.userId}`;
    case OperationType.UNBLOCK_USER:
      return `在账户${logPayload.accountName}中解封用户${logPayload.userId}`;
    case OperationType.ACCOUNT_SET_CHARGE_LIMIT:
      return `在账户${logPayload.accountName}中设置用户${logPayload.userId}限额为${moneyToString(logPayload.limit)}元`;
    case OperationType.ACCOUNT_UNSET_CHARGE_LIMIT:
      return `在账户${logPayload.accountName}中取消用户${logPayload.userId}限额`;
    case OperationType.SET_TENANT_ADMIN:
      return `设置用户${logPayload.userId}为租户${logPayload.tenantName}的管理员`;
    case OperationType.UNSET_TENANT_ADMIN:
      return `取消用户${logPayload.userId}为租户${logPayload.tenantName}的管理员`;
    case OperationType.SET_TENANT_FINANCE:
      return `设置用户${logPayload.userId}为租户${logPayload.tenantName}的财务人员`;
    case OperationType.UNSET_TENANT_FINANCE:
      return `取消用户${logPayload.userId}为租户${logPayload.tenantName}的财务人员`;
    case OperationType.TENANT_CHANGE_PASSWORD:
      return `重置用户${logPayload.userId}的登录密码`;
    case OperationType.CREATE_ACCOUNT:
      return `创建账户${logPayload.accountName}, 拥有者为${logPayload.accountOwner}`;
    case OperationType.ADD_ACCOUNT_TO_WHITELIST:
      return `将账户${logPayload.accountName}添加到租户${logPayload.tenantName}的白名单中`;
    case OperationType.REMOVE_ACCOUNT_FROM_WHITELIST:
      return `将账户${logPayload.accountName}从租户${logPayload.tenantName}的白名单中移出`;
    case OperationType.ACCOUNT_PAY:
      return `为账户${logPayload.accountName}充值${moneyToString(logPayload.amount)}元`;
    case OperationType.IMPORT_USERS:
      return `给租户${logPayload.tenantName}导入用户, ${logPayload.importAccounts.map(
        (account: { accountName: string; userIds: string[];}) =>
          (`在账户${account.accountName}下导入用户${account.userIds.join("、")}`),
      ).join(", ")}`;
    case OperationType.SET_PLATFORM_ADMIN:
      return `设置用户${logPayload.userId}为平台管理员`;
    case OperationType.UNSET_PLATFORM_ADMIN:
      return `取消用户${logPayload.userId}为平台管理员`;
    case OperationType.SET_PLATFORM_FINANCE:
      return `设置用户${logPayload.userId}为平台财务人员`;
    case OperationType.UNSET_PLATFORM_FINANCE:
      return `取消用户${logPayload.userId}为平台财务人员`;
    case OperationType.PLATFORM_CHANGE_PASSWORD:
      return `重置用户${logPayload.userId}的登录密码`;
    case OperationType.CREATE_TENANT:
      return `创建租户${logPayload.tenantName}, 租户管理员为: ${logPayload.tenantAdmin}`;
    case OperationType.TENANT_PAY:
      return `为租户${logPayload.tenantName}充值${moneyToString(logPayload.amount)}`;
    case OperationType.CREATE_USER:
      return `创建用户${logPayload.userId}`;
    case OperationType.SET_JOB_TIME_LIMIT:
      return `${logPayload.delta > 0 ? "增加" : "减少"}作业(ID: ${logPayload.jobId})时限 ${Math.abs(logPayload.delta)} 分钟`;
    case OperationType.SET_TENANT_BILLING:
      return `设置租户${logPayload.tenantName}的计费项${logPayload.path}价格为${moneyToString(logPayload.price)}元`;
    case OperationType.SET_PLATFORM_BILLING:
      return `设置平台的计费项${logPayload.path}价格为${moneyToString(logPayload.price)}元`;
    default:
      return "-";
    }
  } catch (e) {
    return "-";
  }
};


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
    // TODO  获取该tenant所有的userId
    const client = getClient(UserServiceClient);
    const { users } = await asyncClientCall(client, "getUsers", {
      tenantName: info.tenant,
    });

    // 搜索条件中的userId必须是属于该tenant的
    filter.operatorUserIds = users.map((u) => u.userId);
  };

  if (type === OperationLogQueryType.PLATFORM) {
    if (!info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)) {
      return { 403: null };
    }
  }
  const { getLog } = createOperationLogClient(runtimeConfig.OPERATION_LOG_CONFIG, console);
  const resp = await getLog({ filter, page, pageSize });

  const { results, totalCount } = resp;

  const operationLogs = results.map((x) => {
    return {
      operatorUserId: x.operatorUserId,
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
