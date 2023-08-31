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

import { OperationType as LibOperationType, OperationTypeEnum } from "@scow/lib-operation-log";
import { OperationLog as OperationLogProto } from "@scow/protos/build/audit/operation_log";
import { Static, Type } from "@sinclair/typebox";
import { ValueOf } from "next/dist/shared/lib/constants";
import { moneyToString } from "src/utils/money";

export const OperationResult = {
  UNKNOWN: 0,
  SUCCESS: 1,
  FAIL: 2,
} as const;

export type OperationResult = ValueOf<typeof OperationResult>

export const OperationType: OperationTypeEnum = {
  login: "login",
  logout: "logout",
  submitJob: "submitJob",
  endJob: "endJob",
  addJobTemplate: "addJobTemplate",
  deleteJobTemplate: "deleteJobTemplate",
  updateJobTemplate: "updateJobTemplate",
  shellLogin: "shellLogin",
  createDesktop: "createDesktop",
  deleteDesktop: "deleteDesktop",
  createApp: "createApp",
  createFile: "createFile",
  deleteFile: "deleteFile",
  uploadFile: "uploadFile",
  createDirectory: "createDirectory",
  deleteDirectory: "deleteDirectory",
  moveFileItem: "moveFileItem",
  copyFileItem: "copyFileItem",
  setJobTimeLimit: "setJobTimeLimit",
  createUser: "createUser",
  addUserToAccount: "addUserToAccount",
  removeUserFromAccount: "removeUserFromAccount",
  setAccountAdmin: "setAccountAdmin",
  unsetAccountAdmin: "unsetAccountAdmin",
  blockUser: "blockUser",
  unblockUser: "unblockUser",
  accountSetChargeLimit: "accountSetChargeLimit",
  accountUnsetChargeLimit: "accountUnsetChargeLimit",
  setTenantBilling: "setTenantBilling",
  setTenantAdmin: "setTenantAdmin",
  unsetTenantAdmin: "unsetTenantAdmin",
  setTenantFinance: "setTenantFinance",
  unsetTenantFinance: "unsetTenantFinance",
  tenantChangePassword: "tenantChangePassword",
  createAccount: "createAccount",
  addAccountToWhitelist: "addAccountToWhitelist",
  removeAccountFromWhitelist: "removeAccountFromWhitelist",
  accountPay: "accountPay",
  importUsers: "importUsers",
  setPlatformAdmin: "setPlatformAdmin",
  unsetPlatformAdmin: "unsetPlatformAdmin",
  setPlatformFinance: "setPlatformFinance",
  unsetPlatformFinance: "unsetPlatformFinance",
  platformChangePassword: "platformChangePassword",
  setPlatformBilling: "setPlatformBilling",
  createTenant: "createTenant",
  tenantPay: "tenantPay",
};

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

export const OperationTypeTexts: { [key in LibOperationType]: string } = {
  login: "用户登录",
  logout: "用户登出",
  submitJob: "提交作业",
  endJob: "结束作业",
  addJobTemplate: "保存作业模板",
  deleteJobTemplate: "删除作业模板",
  updateJobTemplate: "更新作业模板",
  shellLogin: "SHELL登录",
  createDesktop: "新建桌面",
  deleteDesktop: "删除桌面",
  createApp: "创建应用",
  createFile: "新建文件",
  deleteFile: "删除文件",
  uploadFile: "上传文件",
  createDirectory: "新建文件夹",
  deleteDirectory: "删除文件夹",
  moveFileItem: "移动文件/文件夹",
  copyFileItem: "复制文件/文件夹",
  setJobTimeLimit: "设置作业时限",
  createUser: "创建用户",
  addUserToAccount: "添加用户至账户",
  removeUserFromAccount: "从账户移出用户",
  setAccountAdmin: "设置账户管理员",
  unsetAccountAdmin: "取消账户管理员",
  blockUser: "封锁用户",
  unblockUser: "解封用户",
  accountSetChargeLimit: "账户设置限额",
  accountUnsetChargeLimit: "账户取消设置限额",
  setTenantBilling: "设置作业租户计费",
  setTenantAdmin: "设置租户管理员",
  unsetTenantAdmin: "取消租户管理员",
  setTenantFinance: "设置租户财务人员",
  unsetTenantFinance: "取消租户财务人员",
  tenantChangePassword: "租户重置用户密码",
  createAccount: "创建账户",
  addAccountToWhitelist: "添加白名单账户",
  removeAccountFromWhitelist: "移出白名单",
  accountPay: "账户充值",
  importUsers: "导入用户",
  setPlatformAdmin: "设置平台管理员",
  unsetPlatformAdmin: "取消平台管理员",
  setPlatformFinance: "设置平台财务人员",
  unsetPlatformFinance: "取消平台财务人员",
  platformChangePassword: "平台重置用户密码",
  setPlatformBilling: "设置平台作业计费",
  createTenant: "创建租户",
  tenantPay: "租户充值",
};

export const OperationCodeMap: { [key in LibOperationType]: string } = {
  login: "000001",
  logout: "000002",
  submitJob: "010101",
  endJob: "010102",
  addJobTemplate: "010103",
  deleteJobTemplate: "010104",
  updateJobTemplate: "010105",
  shellLogin: "010201",
  createDesktop: "010301",
  deleteDesktop: "010302",
  createApp: "010401",
  createFile: "010501",
  createDirectory: "010502",
  uploadFile: "010503",
  deleteFile: "010504",
  deleteDirectory: "010505",
  moveFileItem: "010506",
  copyFileItem: "010507",
  setJobTimeLimit: "010601",
  createUser: "020201",
  addUserToAccount: "020202",
  removeUserFromAccount: "020203",
  setAccountAdmin: "020204",
  unsetAccountAdmin: "020205",
  blockUser: "020206",
  unblockUser: "020207",
  accountSetChargeLimit: "020208",
  accountUnsetChargeLimit: "020209",
  setTenantBilling: "030101",
  setTenantAdmin: "030202",
  unsetTenantAdmin: "030203",
  setTenantFinance: "030204",
  unsetTenantFinance: "030205",
  tenantChangePassword: "030206",
  createAccount: "030301",
  addAccountToWhitelist: "030302",
  removeAccountFromWhitelist: "030303",
  accountPay: "030304",
  importUsers: "040101",
  setPlatformAdmin: "040201",
  unsetPlatformAdmin: "040202",
  setPlatformFinance: "040203",
  unsetPlatformFinance: "040204",
  platformChangePassword: "040205",
  setPlatformBilling: "040206",
  createTenant: "040301",
  tenantPay: "040302",
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
    case "login":
      return "用户登录";
    case "logout":
      return "用户退出登录";
    case "submitJob":
      return `在账户${logPayload.accountName}下提交作业(ID: ${logPayload.jobId})`;
    case "endJob":
      return `结束作业(ID: ${logPayload.jobId})`;
    case "addJobTemplate":
      return `保存作业模板(模板名: ${logPayload.jobTemplateId})`;
    case "deleteJobTemplate":
      return `删除作业模板(模板名：${logPayload.jobTemplateId})`;
    case "updateJobTemplate":
      return `更新作业模板(旧模板名：${logPayload.jobTemplateId}，新模板名：${logPayload.newJobTemplateId})`;
    case "shellLogin":
      return `登录${logPayload.clusterId}集群的${logPayload.loginNode}节点`;
    case "createDesktop":
      return `新建桌面(桌面名：${logPayload.desktopName}, 桌面类型: ${logPayload.wm})`;
    case "deleteDesktop":
      return `删除桌面(桌面ID: ${logPayload.loginNode}:${logPayload.desktopId})`;
    case "createApp":
      return `在账户${logPayload.accountName}下创建应用(ID: ${logPayload.jobId})`;
    case "createFile":
      return `新建文件：${logPayload.path}`;
    case "deleteFile":
      return `删除文件：${logPayload.path}`;
    case "uploadFile":
      return `上传文件：${logPayload.path}`;
    case "createDirectory":
      return `新建文件夹：${logPayload.path}`;
    case "deleteDirectory":
      return `删除文件夹：${logPayload.path}`;
    case "moveFileItem":
      return `移动文件/文件夹：${logPayload.fromPath}至${logPayload.toPath}`;
    case "copyFileItem":
      return `复制文件/文件夹：${logPayload.fromPath}至${logPayload.toPath}`;
    case "setJobTimeLimit":
      return `设置作业(ID: ${logPayload.jobId})时限 ${Math.abs(logPayload.limit_minutes)} 分钟`;
    case "createUser":
      return `创建用户${logPayload.userId}`;
    case "addUserToAccount":
      return `将用户${logPayload.userId}添加到账户${logPayload.accountName}中`;
    case "removeUserFromAccount":
      return `将用户${logPayload.userId}从账户${logPayload.accountName}中移除`;
    case "setAccountAdmin":
      return `设置用户${logPayload.userId}为账户${logPayload.accountName}的管理员`;
    case "unsetAccountAdmin":
      return `取消用户${logPayload.userId}为账户${logPayload.accountName}的管理员`;
    case "blockUser":
      return `在账户${logPayload.accountName}中封锁用户${logPayload.userId}`;
    case "unblockUser":
      return `在账户${logPayload.accountName}中解封用户${logPayload.userId}`;
    case "accountSetChargeLimit":
      return `在账户${logPayload.accountName}中设置用户${logPayload.userId}限额为${moneyToString(logPayload.limit)}元`;
    case "accountUnsetChargeLimit":
      return `在账户${logPayload.accountName}中取消用户${logPayload.userId}限额`;
    case "setTenantBilling":
      return `设置租户${logPayload.tenantName}的计费项${logPayload.path}价格为${moneyToString(logPayload.price)}元`;
    case "setTenantAdmin":
      return `设置用户${logPayload.userId}为租户${logPayload.tenantName}的管理员`;
    case "unsetTenantAdmin":
      return `取消用户${logPayload.userId}为租户${logPayload.tenantName}的管理员`;
    case "setTenantFinance":
      return `设置用户${logPayload.userId}为租户${logPayload.tenantName}的财务人员`;
    case "unsetTenantFinance":
      return `取消用户${logPayload.userId}为租户${logPayload.tenantName}的财务人员`;
    case "tenantChangePassword":
      return `重置用户${logPayload.userId}的登录密码`;
    case "createAccount":
      return `创建账户${logPayload.accountName}, 拥有者为${logPayload.accountOwner}`;
    case "addAccountToWhitelist":
      return `将账户${logPayload.accountName}添加到租户${logPayload.tenantName}的白名单中`;
    case "removeAccountFromWhitelist":
      return `将账户${logPayload.accountName}从租户${logPayload.tenantName}的白名单中移出`;
    case "accountPay":
      return `为账户${logPayload.accountName}充值${moneyToString(logPayload.amount)}元`;
    case "importUsers":
      return `给租户${logPayload.tenantName}导入用户, ${logPayload.importAccounts.map(
        (account: { accountName: string; userIds: string[];}) =>
          (`在账户${account.accountName}下导入用户${account.userIds.join("、")}`),
      ).join(", ")}`;
    case "setPlatformAdmin":
      return `设置用户${logPayload.userId}为平台管理员`;
    case "unsetPlatformAdmin":
      return `取消用户${logPayload.userId}为平台管理员`;
    case "setPlatformFinance":
      return `设置用户${logPayload.userId}为平台财务人员`;
    case "unsetPlatformFinance":
      return `取消用户${logPayload.userId}为平台财务人员`;
    case "platformChangePassword":
      return `重置用户${logPayload.userId}的登录密码`;
    case "createTenant":
      return `创建租户${logPayload.tenantName}, 租户管理员为: ${logPayload.tenantAdmin}`;
    case "tenantPay":
      return `为租户${logPayload.tenantName}充值${moneyToString(logPayload.amount)}`;
    case "setPlatformBilling":
      return `设置平台的计费项${logPayload.path}价格为${moneyToString(logPayload.price)}元`;
    default:
      return "-";
    }
  } catch (e) {
    return "-";
  }
};
