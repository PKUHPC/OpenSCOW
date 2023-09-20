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

import { OperationEvent, OperationType as LibOperationType, OperationTypeEnum } from "@scow/lib-operation-log";
import { Static, Type } from "@sinclair/typebox";
import { ValueOf } from "next/dist/shared/lib/constants";
import { nullableMoneyToString } from "src/utils/money";

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
  blockAccount: "blockAccount",
  unblockAccount: "unblockAccount",
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
  operatorUserName: Type.String(),
  operatorIp: Type.String(),
  operationResult: Type.Enum(OperationResult),
  operationTime: Type.Optional(Type.String()),
  operationEvent: Type.Any(),
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
  blockAccount: "封锁帐户",
  unblockAccount: "解封帐户",
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
  blockAccount: "030305",
  unblockAccount: "030306",
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

export const getOperationDetail = (operationEvent: OperationEvent) => {

  try {
    if (!operationEvent) {
      return "";
    }
    const logEvent = operationEvent.$case;
    switch (logEvent) {
    case "login":
      return "用户登录";
    case "logout":
      return "用户退出登录";
    case "submitJob":
      return `在账户${operationEvent[logEvent].accountName}下提交作业(ID: ${operationEvent[logEvent].jobId})`;
    case "endJob":
      return `结束作业(ID: ${operationEvent[logEvent].jobId})`;
    case "addJobTemplate":
      return `保存作业模板(模板名: ${operationEvent[logEvent].jobTemplateId})`;
    case "deleteJobTemplate":
      return `删除作业模板(模板名：${operationEvent[logEvent].jobTemplateId})`;
    case "updateJobTemplate":
      return `更新作业模板(旧模板名：${operationEvent[logEvent].jobTemplateId}，新模板名：${operationEvent[logEvent].newJobTemplateId})`;
    case "shellLogin":
      return `登录${operationEvent[logEvent].clusterId}集群的${operationEvent[logEvent].loginNode}节点`;
    case "createDesktop":
      return `新建桌面(桌面名：${operationEvent[logEvent].desktopName}, 桌面类型: ${operationEvent[logEvent].wm})`;
    case "deleteDesktop":
      return `删除桌面(桌面ID: ${operationEvent[logEvent].loginNode}:${operationEvent[logEvent].desktopId})`;
    case "createApp":
      return `在账户${operationEvent[logEvent].accountName}下创建应用(ID: ${operationEvent[logEvent].jobId})`;
    case "createFile":
      return `新建文件：${operationEvent[logEvent].path}`;
    case "deleteFile":
      return `删除文件：${operationEvent[logEvent].path}`;
    case "uploadFile":
      return `上传文件：${operationEvent[logEvent].path}`;
    case "createDirectory":
      return `新建文件夹：${operationEvent[logEvent].path}`;
    case "deleteDirectory":
      return `删除文件夹：${operationEvent[logEvent].path}`;
    case "moveFileItem":
      return `移动文件/文件夹：${operationEvent[logEvent].fromPath}至${operationEvent[logEvent].toPath}`;
    case "copyFileItem":
      return `复制文件/文件夹：${operationEvent[logEvent].fromPath}至${operationEvent[logEvent].toPath}`;
    case "setJobTimeLimit":
      return `设置作业(ID: ${operationEvent[logEvent].jobId})时限 ${Math.abs(operationEvent[logEvent].limitMinutes)} 分钟`;
    case "createUser":
      return `创建用户${operationEvent[logEvent].userId}`;
    case "addUserToAccount":
      return `将用户${operationEvent[logEvent].userId}添加到账户${operationEvent[logEvent].accountName}中`;
    case "removeUserFromAccount":
      return `将用户${operationEvent[logEvent].userId}从账户${operationEvent[logEvent].accountName}中移除`;
    case "setAccountAdmin":
      return `设置用户${operationEvent[logEvent].userId}为账户${operationEvent[logEvent].accountName}的管理员`;
    case "unsetAccountAdmin":
      return `取消用户${operationEvent[logEvent].userId}为账户${operationEvent[logEvent].accountName}的管理员`;
    case "blockUser":
      return `在账户${operationEvent[logEvent].accountName}中封锁用户${operationEvent[logEvent].userId}`;
    case "unblockUser":
      return `在账户${operationEvent[logEvent].accountName}中解封用户${operationEvent[logEvent].userId}`;
    case "accountSetChargeLimit":
      return `在账户${operationEvent[logEvent].accountName}中设置用户${
        operationEvent[logEvent].userId}限额为${nullableMoneyToString(operationEvent[logEvent].limit)}元`;
    case "accountUnsetChargeLimit":
      return `在账户${operationEvent[logEvent].accountName}中取消用户${operationEvent[logEvent].userId}限额`;
    case "setTenantBilling":
      return `设置租户${operationEvent[logEvent].tenantName}的计费项${
        operationEvent[logEvent].path}价格为${nullableMoneyToString(operationEvent[logEvent].price)}元`;
    case "setTenantAdmin":
      return `设置用户${operationEvent[logEvent].userId}为租户${operationEvent[logEvent].tenantName}的管理员`;
    case "unsetTenantAdmin":
      return `取消用户${operationEvent[logEvent].userId}为租户${operationEvent[logEvent].tenantName}的管理员`;
    case "setTenantFinance":
      return `设置用户${operationEvent[logEvent].userId}为租户${operationEvent[logEvent].tenantName}的财务人员`;
    case "unsetTenantFinance":
      return `取消用户${operationEvent[logEvent].userId}为租户${operationEvent[logEvent].tenantName}的财务人员`;
    case "tenantChangePassword":
      return `重置用户${operationEvent[logEvent].userId}的登录密码`;
    case "createAccount":
      return `创建账户${operationEvent[logEvent].accountName}, 拥有者为${operationEvent[logEvent].accountOwner}`;
    case "addAccountToWhitelist":
      return `将账户${operationEvent[logEvent].accountName}添加到租户${operationEvent[logEvent].tenantName}的白名单中`;
    case "removeAccountFromWhitelist":
      return `将账户${operationEvent[logEvent].accountName}从租户${operationEvent[logEvent].tenantName}的白名单中移出`;
    case "accountPay":
      return `为账户${operationEvent[logEvent].accountName}充值${nullableMoneyToString(operationEvent[logEvent].amount)}元`;
    case "blockAccount":
      return `在租户${operationEvent[logEvent].tenantName}中封锁账户${operationEvent[logEvent].accountName}`;
    case "unblockAccount":
      return `在租户${operationEvent[logEvent].tenantName}中解封帐户${operationEvent[logEvent].accountName}`;
    case "importUsers":
      return `给租户${operationEvent[logEvent].tenantName}导入用户, ${operationEvent[logEvent].importAccounts.map(
        (account: { accountName: string; userIds: string[];}) =>
          (`在账户${account.accountName}下导入用户${account.userIds.join("、")}`),
      ).join(", ")}`;
    case "setPlatformAdmin":
      return `设置用户${operationEvent[logEvent].userId}为平台管理员`;
    case "unsetPlatformAdmin":
      return `取消用户${operationEvent[logEvent].userId}为平台管理员`;
    case "setPlatformFinance":
      return `设置用户${operationEvent[logEvent].userId}为平台财务人员`;
    case "unsetPlatformFinance":
      return `取消用户${operationEvent[logEvent].userId}为平台财务人员`;
    case "platformChangePassword":
      return `重置用户${operationEvent[logEvent].userId}的登录密码`;
    case "createTenant":
      return `创建租户${operationEvent[logEvent].tenantName}, 租户管理员为: ${operationEvent[logEvent].tenantAdmin}`;
    case "tenantPay":
      return `为租户${operationEvent[logEvent].tenantName}充值${nullableMoneyToString(operationEvent[logEvent].amount)}元`;
    case "setPlatformBilling":
      return `设置平台的计费项${operationEvent[logEvent].path}价格为${nullableMoneyToString(operationEvent[logEvent].price)}元`;
    default:
      return "-";
    }
  } catch (e) {
    return "-";
  }
};
