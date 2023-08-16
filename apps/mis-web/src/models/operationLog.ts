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

import { OperationLog as OperationLogProto } from "@scow/protos/build/operation-log/operation_log";
import { Static, Type } from "@sinclair/typebox";
import { ValueOf } from "next/dist/shared/lib/constants";
import { moneyToString } from "src/utils/money";

export const OperationResult = {
  UNKNOWN: 0,
  SUCCESS: 1,
  FAIL: 2,
} as const;

export type OperationResult = ValueOf<typeof OperationResult>

export const OperationType = {
  LOGIN: "login",
  LOGOUT: "logout",
  SUBMIT_JOB: "submitJob",
  END_JOB: "endJob",
  ADD_JOB_TEMPLATE: "addJobTemplate",
  DELETE_JOB_TEMPLATE: "deleteJobTemplate",
  UPDATE_JOB_TEMPLATE: "updateJobTemplate",
  SHELL_LOGIN: "shellLogin",
  CREATE_DESKTOP: "createDesktop",
  DELETE_DESKTOP: "deleteDesktop",
  CREATE_APP: "createApp",
  CREATE_FILE: "createFile",
  DELETE_FILE: "deleteFile",
  UPLOAD_FILE: "uploadFile",
  CREATE_DIRECTORY: "createDirectory",
  DELETE_DIRECTORY: "deleteDirectory",
  MOVE_FILE_ITEM: "moveFileItem",
  COPY_FILE_ITEM: "copyFileItem",
  // MIS
  SET_JOB_TIME_LIMIT: "setJobTimeLimit",
  CREATE_USER: "createUser",
  ADD_USER_TO_ACCOUNT: "addUserToAccount",
  REMOVE_USER_FROM_ACCOUNT: "removeUserFromAccount",
  SET_ACCOUNT_ADMIN: "setAccountAdmin",
  UNSET_ACCOUNT_ADMIN: "unsetAccountAdmin",
  BLOCK_USER: "blockUser",
  UNBLOCK_USER: "unblockUser",
  ACCOUNT_SET_CHARGE_LIMIT: "accountSetChargeLimit",
  ACCOUNT_UNSET_CHARGE_LIMIT: "accountUnsetChargeLimit",
  SET_TENANT_BILLING: "setTenantBilling",
  SET_TENANT_ADMIN: "setTenantAdmin",
  UNSET_TENANT_ADMIN: "unsetTenantAdmin",
  SET_TENANT_FINANCE: "setTenantFinance",
  UNSET_TENANT_FINANCE: "unsetTenantFinance",
  TENANT_CHANGE_PASSWORD: "tenantChangePassword",
  CREATE_ACCOUNT: "createAccount",
  ADD_ACCOUNT_TO_WHITELIST: "addAccountToWhitelist",
  REMOVE_ACCOUNT_FROM_WHITELIST: "removeAccountFromWhitelist",
  ACCOUNT_PAY: "accountPay",
  IMPORT_USERS: "importUsers",
  SET_PLATFORM_ADMIN: "setPlatformAdmin",
  UNSET_PLATFORM_ADMIN: "unsetPlatformAdmin",
  SET_PLATFORM_FINANCE: "setPlatformFinance",
  UNSET_PLATFORM_FINANCE: "unsetPlatformFinance",
  PLATFORM_CHANGE_PASSWORD: "platformChangePassword",
  SET_PLATFORM_BILLING: "setPlatformBilling",
  CREATE_TENANT: "createTenant",
  PLATFORM_SET_TENANT_BILLING: "platformSetTenantBilling",
  TENANT_PAY: "tenantPay",
} as const;

export type OperationType = ValueOf<typeof OperationType>

export const OperationLog = Type.Object({
  operationLogId: Type.Number(),
  operatorUserId: Type.String(),
  operatorIp: Type.String(),
  operationCode: Type.String(),
  operationType: Type.Enum(OperationType),
  operationResult: Type.Enum(OperationResult),
  operationTime: Type.Optional(Type.String()),
  operationDetail: Type.String(),
});
export type OperationLog = Static<typeof OperationLog>;

export enum OperationLogQueryType {
  USER = 0,
  ACCOUNT = 1,
  TENANT = 2,
  PLATFORM = 3,
};

export const OperationResultTexts = {
  [OperationResult.UNKNOWN]: "未知",
  [OperationResult.SUCCESS]: "成功",
  [OperationResult.FAIL]: "失败",
};

export const OperationTypeTexts = {
  [OperationType.LOGIN]: "用户登录",
  [OperationType.LOGOUT]: "用户登出",
  [OperationType.SUBMIT_JOB]: "提交作业",
  [OperationType.END_JOB]: "结束作业",
  [OperationType.ADD_JOB_TEMPLATE]: "保存作业模板",
  [OperationType.DELETE_JOB_TEMPLATE]: "删除作业模板",
  [OperationType.UPDATE_JOB_TEMPLATE]: "更新作业模板",
  [OperationType.SHELL_LOGIN]: "SHELL登录",
  [OperationType.CREATE_DESKTOP]: "新建桌面",
  [OperationType.DELETE_DESKTOP]: "删除桌面",
  [OperationType.CREATE_APP]: "创建应用",
  [OperationType.CREATE_FILE]: "新建文件",
  [OperationType.CREATE_DIRECTORY]: "新建文件夹",
  [OperationType.UPLOAD_FILE]: "上传文件",
  [OperationType.DELETE_FILE]: "删除文件",
  [OperationType.DELETE_DIRECTORY]: "删除文件夹",
  [OperationType.MOVE_FILE_ITEM]: "移动文件/文件夹",
  [OperationType.COPY_FILE_ITEM]: "复制文件/文件夹",
  [OperationType.SET_JOB_TIME_LIMIT]: "设置作业时限",
  [OperationType.CREATE_USER]: "创建用户",
  [OperationType.ADD_USER_TO_ACCOUNT]: "添加用户至账户",
  [OperationType.REMOVE_USER_FROM_ACCOUNT]: "从账户移出用户",
  [OperationType.SET_ACCOUNT_ADMIN]: "设置账户管理员",
  [OperationType.UNSET_ACCOUNT_ADMIN]: "取消账户管理员",
  [OperationType.BLOCK_USER]: "封锁用户",
  [OperationType.UNBLOCK_USER]: "解封用户",
  [OperationType.ACCOUNT_SET_CHARGE_LIMIT]: "账户设置限额",
  [OperationType.ACCOUNT_UNSET_CHARGE_LIMIT]: "账户取消设置限额",
  [OperationType.SET_TENANT_BILLING]: "修改作业租户计费",
  [OperationType.SET_TENANT_ADMIN]: "设置租户管理员",
  [OperationType.UNSET_TENANT_ADMIN]: "取消租户管理员",
  [OperationType.SET_TENANT_FINANCE]: "设置租户财务人员",
  [OperationType.UNSET_TENANT_FINANCE]: "取消租户财务人员",
  [OperationType.TENANT_CHANGE_PASSWORD]: "租户重置用户密码",
  [OperationType.CREATE_ACCOUNT]: "创建账户",
  [OperationType.ADD_ACCOUNT_TO_WHITELIST]: "添加白名单账户",
  [OperationType.REMOVE_ACCOUNT_FROM_WHITELIST]: "移出白名单",
  [OperationType.ACCOUNT_PAY]: "账户充值",
  [OperationType.IMPORT_USERS]: "导入用户",
  [OperationType.SET_PLATFORM_ADMIN]: "设置平台管理员",
  [OperationType.UNSET_PLATFORM_ADMIN]: "取消平台管理员",
  [OperationType.SET_PLATFORM_FINANCE]: "设置平台财务人员",
  [OperationType.UNSET_PLATFORM_FINANCE]: "取消平台财务人员",
  [OperationType.PLATFORM_CHANGE_PASSWORD]: "平台重置用户密码",
  [OperationType.SET_PLATFORM_BILLING]: "设置平台作业计费",
  [OperationType.CREATE_TENANT]: "创建租户",
  [OperationType.PLATFORM_SET_TENANT_BILLING]: "平台设置租户计费",
  [OperationType.TENANT_PAY]: "租户充值",
};

export const OperationCodeMap = {
  [OperationType.LOGIN]: "000001",
  [OperationType.LOGOUT]: "000002",
  [OperationType.SUBMIT_JOB]: "010101",
  [OperationType.END_JOB]: "010102",
  [OperationType.ADD_JOB_TEMPLATE]: "010104",
  [OperationType.DELETE_JOB_TEMPLATE]: "010105",
  [OperationType.UPDATE_JOB_TEMPLATE]: "010106",
  [OperationType.SHELL_LOGIN]: "010201",
  [OperationType.CREATE_DESKTOP]: "010301",
  [OperationType.DELETE_DESKTOP]: "010302",
  [OperationType.CREATE_APP]: "010401",
  [OperationType.CREATE_FILE]: "010501",
  [OperationType.CREATE_DIRECTORY]: "010502",
  [OperationType.UPLOAD_FILE]: "010503",
  [OperationType.DELETE_FILE]: "010504",
  [OperationType.DELETE_DIRECTORY]: "010505",
  [OperationType.MOVE_FILE_ITEM]: "010508",
  [OperationType.COPY_FILE_ITEM]: "010510",
  [OperationType.SET_JOB_TIME_LIMIT]: "010601",
  [OperationType.CREATE_USER]: "020201",
  [OperationType.ADD_USER_TO_ACCOUNT]: "020202",
  [OperationType.REMOVE_USER_FROM_ACCOUNT]: "020203",
  [OperationType.SET_ACCOUNT_ADMIN]: "020204",
  [OperationType.UNSET_ACCOUNT_ADMIN]: "020205",
  [OperationType.BLOCK_USER]: "020206",
  [OperationType.UNBLOCK_USER]: "020207",
  [OperationType.ACCOUNT_SET_CHARGE_LIMIT]: "020208",
  [OperationType.ACCOUNT_UNSET_CHARGE_LIMIT]: "020209",
  [OperationType.SET_TENANT_BILLING]: "030102",
  [OperationType.SET_TENANT_ADMIN]: "030202",
  [OperationType.UNSET_TENANT_ADMIN]: "030203",
  [OperationType.SET_TENANT_FINANCE]: "030204",
  [OperationType.UNSET_TENANT_FINANCE]: "030205",
  [OperationType.TENANT_CHANGE_PASSWORD]: "030206",
  [OperationType.CREATE_ACCOUNT]: "030301",
  [OperationType.ADD_ACCOUNT_TO_WHITELIST]: "030302",
  [OperationType.REMOVE_ACCOUNT_FROM_WHITELIST]: "030303",
  [OperationType.ACCOUNT_PAY]: "030304",
  [OperationType.IMPORT_USERS]: "040101",
  [OperationType.SET_PLATFORM_ADMIN]: "040201",
  [OperationType.UNSET_PLATFORM_ADMIN]: "040202",
  [OperationType.SET_PLATFORM_FINANCE]: "040203",
  [OperationType.UNSET_PLATFORM_FINANCE]: "040204",
  [OperationType.PLATFORM_CHANGE_PASSWORD]: "040205",
  [OperationType.SET_PLATFORM_BILLING]: "040206",
  [OperationType.CREATE_TENANT]: "040301",
  [OperationType.PLATFORM_SET_TENANT_BILLING]: "040302",
  [OperationType.TENANT_PAY]: "040303",
};

export const getOperationDetail = (operationLog: OperationLogProto) => {

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
