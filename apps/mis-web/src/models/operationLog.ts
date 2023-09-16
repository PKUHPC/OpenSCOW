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
import { Login, OperationLog as OperationLogProto } from "@scow/protos/build/audit/operation_log";
import { Static, Type } from "@sinclair/typebox";
import { ValueOf } from "next/dist/shared/lib/constants";
import { Lang } from "react-typed-i18n";
import { prefix, TransType } from "src/i18n";
import en from "src/i18n/en";
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
  operationCode: Type.String(),
  operationType: Type.Enum(OperationType),
  operationResult: Type.Enum(OperationResult),
  operationTime: Type.Optional(Type.String()),
  operationDetail: Type.String(),
  //
  operationEvent: Type.Optional(Type.Any()),
});
export type OperationLog = Static<typeof OperationLog>;

export enum OperationLogQueryType {
  USER = 0,
  ACCOUNT = 1,
  TENANT = 2,
  PLATFORM = 3,
};

type OperationTextsTransType = (id: Lang<typeof en>, args?: React.ReactNode[]) => string;
const pRes = prefix("operationLog.resultTexts.");
const pTypes = prefix("operationLog.operationTypeTexts.");
const pDetails = prefix("operationLog.operationDetails.");

export const getOperationResultTexts = (t: OperationTextsTransType) => {

  return {
    [OperationResult.UNKNOWN]: t(pRes("unknown")),
    [OperationResult.SUCCESS]: t(pRes("success")),
    [OperationResult.FAIL]: t(pRes("fail")),
  };

};

export const getOperationTypeTexts = (t: OperationTextsTransType): { [key in LibOperationType]: string } => {

  return {
    login: t(pTypes("login")),
    logout: t(pTypes("logout")),
    submitJob: t(pTypes("submitJob")),
    endJob: t(pTypes("endJob")),
    addJobTemplate: t(pTypes("addJobTemplate")),
    deleteJobTemplate: t(pTypes("deleteJobTemplate")),
    updateJobTemplate: t(pTypes("updateJobTemplate")),
    shellLogin: t(pTypes("shellLogin")),
    createDesktop: t(pTypes("createDesktop")),
    deleteDesktop: t(pTypes("deleteDesktop")),
    createApp: t(pTypes("createApp")),
    createFile: t(pTypes("createFile")),
    deleteFile: t(pTypes("deleteFile")),
    uploadFile: t(pTypes("uploadFile")),
    createDirectory: t(pTypes("createDirectory")),
    deleteDirectory: t(pTypes("deleteDirectory")),
    moveFileItem: t(pTypes("moveFileItem")),
    copyFileItem: t(pTypes("copyFileItem")),
    setJobTimeLimit: t(pTypes("setJobTimeLimit")),
    createUser: t(pTypes("createUser")),
    addUserToAccount: t(pTypes("addUserToAccount")),
    removeUserFromAccount: t(pTypes("removeUserFromAccount")),
    setAccountAdmin: t(pTypes("setAccountAdmin")),
    unsetAccountAdmin: t(pTypes("unsetAccountAdmin")),
    blockUser: t(pTypes("blockUser")),
    unblockUser: t(pTypes("unblockUser")),
    accountSetChargeLimit: t(pTypes("accountSetChargeLimit")),
    accountUnsetChargeLimit: t(pTypes("accountUnsetChargeLimit")),
    setTenantBilling: t(pTypes("setTenantBilling")),
    setTenantAdmin: t(pTypes("setTenantAdmin")),
    unsetTenantAdmin: t(pTypes("unsetTenantAdmin")),
    setTenantFinance: t(pTypes("setTenantFinance")),
    unsetTenantFinance: t(pTypes("unsetTenantFinance")),
    tenantChangePassword: t(pTypes("tenantChangePassword")),
    createAccount: t(pTypes("createAccount")),
    addAccountToWhitelist: t(pTypes("addAccountToWhitelist")),
    removeAccountFromWhitelist: t(pTypes("removeAccountFromWhitelist")),
    accountPay: t(pTypes("accountPay")),
    blockAccount: t(pTypes("blockAccount")),
    unblockAccount: t(pTypes("unblockAccount")),
    importUsers: t(pTypes("importUsers")),
    setPlatformAdmin: t(pTypes("setPlatformAdmin")),
    unsetPlatformAdmin: t(pTypes("unsetPlatformAdmin")),
    setPlatformFinance: t(pTypes("setPlatformFinance")),
    unsetPlatformFinance: t(pTypes("unsetPlatformFinance")),
    platformChangePassword: t(pTypes("platformChangePassword")),
    setPlatformBilling: t(pTypes("setPlatformBilling")),
    createTenant: t(pTypes("createTenant")),
    tenantPay: t(pTypes("tenantPay")),
  };

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

type OperationTextsArgsTransType = (id: Lang<typeof en>, args?: React.ReactNode[]) => string | React.ReactNode;

export const getOperationDetail = (
  operationLog: OperationLogProto,
  t?: OperationTextsTransType,
  tArgs?: OperationTextsArgsTransType) => {

  try {

    const { operationEvent } = operationLog;

    if (!operationEvent) {
      return "";
    }

    const logEvent = operationEvent.$case;

    switch (logEvent) {
    case "login":
      return t ? t(pDetails("login")) : "用户登录";
    case "logout":
      return t ? t(pDetails("logout")) : "用户退出登录";
    case "submitJob":
      return t ? t(pDetails("submitJob"), [operationEvent[logEvent].accountName, operationEvent[logEvent].jobId]) :
        `在账户${operationEvent[logEvent].accountName}下提交作业(ID: ${operationEvent[logEvent].jobId})`;
    case "endJob":
      return t ? t(pDetails("endJob"), [operationEvent[logEvent].jobId]) :
        `结束作业(ID: ${operationEvent[logEvent].jobId})`;
    case "addJobTemplate":
      return t ? t(pDetails("addJobTemplate"), [operationEvent[logEvent].jobTemplateId]) :
        `保存作业模板(模板名: ${operationEvent[logEvent].jobTemplateId})`;
    case "deleteJobTemplate":
      return t ? t(pDetails("deleteJobTemplate"), [operationEvent[logEvent].jobTemplateId]) :
        `删除作业模板(模板名：${operationEvent[logEvent].jobTemplateId})`;
    case "updateJobTemplate":
      return t ? t(pDetails("updateJobTemplate"),
        [operationEvent[logEvent].jobTemplateId, operationEvent[logEvent].newJobTemplateId]) :
        `更新作业模板(旧模板名：${operationEvent[logEvent].jobTemplateId}，新模板名：${operationEvent[logEvent].newJobTemplateId})`;
    case "shellLogin":
      return t ? t(pDetails("shellLogin"), [operationEvent[logEvent].clusterId, operationEvent[logEvent].loginNode]) :
        `登录${operationEvent[logEvent].clusterId}集群的${operationEvent[logEvent].loginNode}节点`;
    case "createDesktop":
      return t ? t(pDetails("createDesktop"), [operationEvent[logEvent].desktopName, operationEvent[logEvent].wm]) :
        `新建桌面(桌面名：${operationEvent[logEvent].desktopName}, 桌面类型: ${operationEvent[logEvent].wm})`;
    case "deleteDesktop":
      return t ? t(pDetails("deleteDesktop"),
        [operationEvent[logEvent].loginNode, operationEvent[logEvent].desktopId]) :
        `删除桌面(桌面ID: ${operationEvent[logEvent].loginNode}:${operationEvent[logEvent].desktopId})`;
    case "createApp":
      return t ? t(pDetails("createApp"), [operationEvent[logEvent].accountName, operationEvent[logEvent].jobId]) :
        `在账户${operationEvent[logEvent].accountName}下创建应用(ID: ${operationEvent[logEvent].jobId})`;
    case "createFile":
      return t ? t(pDetails("createFile"), [operationEvent[logEvent].path]) :
        `新建文件：${operationEvent[logEvent].path}`;
    case "deleteFile":
      return t ? t(pDetails("deleteFile"), [operationEvent[logEvent].path]) :
        `删除文件：${operationEvent[logEvent].path}`;
    case "uploadFile":
      return t ? t(pDetails("uploadFile"), [operationEvent[logEvent].path]) :
        `上传文件：${operationEvent[logEvent].path}`;
    case "createDirectory":
      return t ? t(pDetails("createDirectory"), [operationEvent[logEvent].path]) :
        `新建文件夹：${operationEvent[logEvent].path}`;
    case "deleteDirectory":
      return t ? t(pDetails("deleteDirectory"), [operationEvent[logEvent].path]) :
        `删除文件夹：${operationEvent[logEvent].path}`;
    case "moveFileItem":
      return t ? t(pDetails("moveFileItem"), [operationEvent[logEvent].fromPath, operationEvent[logEvent].toPath]) :
        `移动文件/文件夹：${operationEvent[logEvent].fromPath}至${operationEvent[logEvent].toPath}`;
    case "copyFileItem":
      return t ? t(pDetails("copyFileItem"), [operationEvent[logEvent].fromPath, operationEvent[logEvent].toPath]) :
        `复制文件/文件夹：${operationEvent[logEvent].fromPath}至${operationEvent[logEvent].toPath}`;
    case "setJobTimeLimit":
      return t ? t(pDetails("setJobTimeLimit"),
        [operationEvent[logEvent].jobId, Math.abs(operationEvent[logEvent].limitMinutes)]) :
        `设置作业(ID: ${operationEvent[logEvent].jobId})时限 ${Math.abs(operationEvent[logEvent].limitMinutes)} 分钟`;
    case "createUser":
      return t ? t(pDetails("createUser"), [operationEvent[logEvent].userId]) :
      // return t ? t(pDetails("createUser")) :
        `创建用户${operationEvent[logEvent].userId}`;
    case "addUserToAccount":
      return t ? t(pDetails("addUserToAccount"),
        [operationEvent[logEvent].userId, operationEvent[logEvent].accountName]) :
        `将用户${operationEvent[logEvent].userId}添加到账户${operationEvent[logEvent].accountName}中`;
    case "removeUserFromAccount":
      return t ? t(pDetails("removeUserFromAccount"),
        [operationEvent[logEvent].userId, operationEvent[logEvent].accountName]) :
        `将用户${operationEvent[logEvent].userId}从账户${operationEvent[logEvent].accountName}中移除`;
    case "setAccountAdmin":
      return t ? t(pDetails("setAccountAdmin"),
        [operationEvent[logEvent].userId, operationEvent[logEvent].accountName]) :
        `设置用户${operationEvent[logEvent].userId}为账户${operationEvent[logEvent].accountName}的管理员`;
    case "unsetAccountAdmin":
      return t ? t(pDetails("unsetAccountAdmin"),
        [operationEvent[logEvent].userId, operationEvent[logEvent].accountName]) :
        `取消用户${operationEvent[logEvent].userId}为账户${operationEvent[logEvent].accountName}的管理员`;
    case "blockUser":
      return t ? t(pDetails("blockUser"), [operationEvent[logEvent].accountName, operationEvent[logEvent].userId]) :
        `在账户${operationEvent[logEvent].accountName}中封锁用户${operationEvent[logEvent].userId}`;
    case "unblockUser":
      return t ? t(pDetails("unblockUser"), [operationEvent[logEvent].accountName, operationEvent[logEvent].userId]) :
        `在账户${operationEvent[logEvent].accountName}中解封用户${operationEvent[logEvent].userId}`;
    case "accountSetChargeLimit":
      return t ? t(pDetails("accountSetChargeLimit"),
        [operationEvent[logEvent].accountName,
          operationEvent[logEvent].userId,
          nullableMoneyToString(operationEvent[logEvent].limit)]) :
        `在账户${operationEvent[logEvent].accountName}中设置用户${
          operationEvent[logEvent].userId}限额为${nullableMoneyToString(operationEvent[logEvent].limit)}元`;
    case "accountUnsetChargeLimit":
      return t ? t(pDetails("accountUnsetChargeLimit"),
        [operationEvent[logEvent].accountName, operationEvent[logEvent].userId]) :
        `在账户${operationEvent[logEvent].accountName}中取消用户${operationEvent[logEvent].userId}限额`;
    case "setTenantBilling":
      return t ? t(pDetails("setTenantBilling"),
        [operationEvent[logEvent].tenantName,
          operationEvent[logEvent].path,
          nullableMoneyToString(operationEvent[logEvent].price)]) :
        `设置租户${operationEvent[logEvent].tenantName}的计费项${
          operationEvent[logEvent].path}价格为${nullableMoneyToString(operationEvent[logEvent].price)}元`;
    case "setTenantAdmin":
      return t ? t(pDetails("setTenantAdmin"), [operationEvent[logEvent].userId, operationEvent[logEvent].tenantName]) :
        `设置用户${operationEvent[logEvent].userId}为租户${operationEvent[logEvent].tenantName}的管理员`;
    case "unsetTenantAdmin":
      return t ? t(pDetails("unsetTenantAdmin"),
        [operationEvent[logEvent].userId, operationEvent[logEvent].tenantName]) :
        `取消用户${operationEvent[logEvent].userId}为租户${operationEvent[logEvent].tenantName}的管理员`;
    case "setTenantFinance":
      return t ? t(pDetails("setTenantFinance"),
        [operationEvent[logEvent].userId, operationEvent[logEvent].tenantName]) :
        `设置用户${operationEvent[logEvent].userId}为租户${operationEvent[logEvent].tenantName}的财务人员`;
    case "unsetTenantFinance":
      return t ? t(pDetails("unsetTenantFinance"),
        [operationEvent[logEvent].userId, operationEvent[logEvent].tenantName]) :
        `取消用户${operationEvent[logEvent].userId}为租户${operationEvent[logEvent].tenantName}的财务人员`;
    case "tenantChangePassword":
      return t ? t(pDetails("tenantChangePassword"), [operationEvent[logEvent].userId]) :
        `重置用户${operationEvent[logEvent].userId}的登录密码`;
    case "createAccount":
      return t ? t(pDetails("createAccount"),
        [operationEvent[logEvent].accountName, operationEvent[logEvent].accountOwner]) :
        `创建账户${operationEvent[logEvent].accountName}, 拥有者为${operationEvent[logEvent].accountOwner}`;
    case "addAccountToWhitelist":
      return t ? t(pDetails("addAccountToWhitelist"),
        [operationEvent[logEvent].accountName, operationEvent[logEvent].tenantName]) :
        `将账户${operationEvent[logEvent].accountName}添加到租户${operationEvent[logEvent].tenantName}的白名单中`;
    case "removeAccountFromWhitelist":
      return t ? t(pDetails("removeAccountFromWhitelist"),
        [operationEvent[logEvent].accountName, operationEvent[logEvent].tenantName]) :
        `将账户${operationEvent[logEvent].accountName}从租户${operationEvent[logEvent].tenantName}的白名单中移出`;
    case "accountPay":
      return t ? t(pDetails("accountPay"),
        [operationEvent[logEvent].accountName, nullableMoneyToString(operationEvent[logEvent].amount)]) :
        `为账户${operationEvent[logEvent].accountName}充值${nullableMoneyToString(operationEvent[logEvent].amount)}元`;
    case "blockAccount":
      return t ? t(pDetails("blockAccount"),
        [operationEvent[logEvent].tenantName, operationEvent[logEvent].accountName]) :
        `在租户${operationEvent[logEvent].tenantName}中封锁账户${operationEvent[logEvent].accountName}`;
    case "unblockAccount":
      return t ? t(pDetails("unblockAccount"),
        [operationEvent[logEvent].tenantName, operationEvent[logEvent].accountName]) :
        `在租户${operationEvent[logEvent].tenantName}中解封帐户${operationEvent[logEvent].accountName}`;
    case "importUsers":
      return t && tArgs ?
        `${t(pDetails("importUsers1"), [operationEvent[logEvent].tenantName])}${
          operationEvent[logEvent].importAccounts.map(
            (account: { accountName: string; userIds: string[];}) =>
              (tArgs(pDetails("importUsers2"), [account.accountName, account.userIds.join("、")])),
          ).join(", ")}` :
        `给租户${operationEvent[logEvent].tenantName}导入用户, ${operationEvent[logEvent].importAccounts.map(
          (account: { accountName: string; userIds: string[];}) =>
            (`在账户${account.accountName}下导入用户${account.userIds.join("、")}`),
        ).join(", ")}`;
    case "setPlatformAdmin":
      return t ? t(pDetails("setPlatformAdmin"), [operationEvent[logEvent].userId]) :
        `设置用户${operationEvent[logEvent].userId}为平台管理员`;
    case "unsetPlatformAdmin":
      return t ? t(pDetails("unsetPlatformAdmin"), [operationEvent[logEvent].userId]) :
        `取消用户${operationEvent[logEvent].userId}为平台管理员`;
    case "setPlatformFinance":
      return t ? t(pDetails("setPlatformFinance"), [operationEvent[logEvent].userId]) :
        `设置用户${operationEvent[logEvent].userId}为平台财务人员`;
    case "unsetPlatformFinance":
      return t ? t(pDetails("unsetPlatformFinance"), [operationEvent[logEvent].userId]) :
        `取消用户${operationEvent[logEvent].userId}为平台财务人员`;
    case "platformChangePassword":
      return t ? t(pDetails("platformChangePassword"), [operationEvent[logEvent].userId]) :
        `重置用户${operationEvent[logEvent].userId}的登录密码`;
    case "createTenant":
      return t ? t(pDetails("createTenant"),
        [operationEvent[logEvent].tenantName, operationEvent[logEvent].tenantAdmin]) :
        `创建租户${operationEvent[logEvent].tenantName}, 租户管理员为: ${operationEvent[logEvent].tenantAdmin}`;
    case "tenantPay":
      return t ? t(pDetails("tenantPay"),
        [operationEvent[logEvent].tenantName, nullableMoneyToString(operationEvent[logEvent].amount)]) :
        `为租户${operationEvent[logEvent].tenantName}充值${nullableMoneyToString(operationEvent[logEvent].amount)}元`;
    case "setPlatformBilling":
      return t ? t(pDetails("setPlatformBilling"),
        [operationEvent[logEvent].path, nullableMoneyToString(operationEvent[logEvent].price)]) :
        `设置平台的计费项${operationEvent[logEvent].path}价格为${nullableMoneyToString(operationEvent[logEvent].price)}元`;
    default:
      return "-";
    }
  } catch (e) {
    return "-";
  }
};
