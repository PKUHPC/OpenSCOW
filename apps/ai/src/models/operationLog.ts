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

import { OperationTypeEnum } from "@scow/lib-operation-log/build/index";
import { ValueOf } from "next/dist/shared/lib/constants";

export const OperationResult = {
  UNKNOWN: 0,
  SUCCESS: 1,
  FAIL: 2,
} as const;

export type OperationResult = ValueOf<typeof OperationResult>;

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
  submitFileItemAsJob: "submitFileItemAsJob",
  exportUser: "exportUser",
  exportAccount: "exportAccount",
  exportChargeRecord: "exportChargeRecord",
  exportPayRecord: "exportPayRecord",
  exportOperationLog: "exportOperationLog",
  setAccountBlockThreshold: "setAccountBlockThreshold",
  setAccountDefaultBlockThreshold: "setAccountDefaultBlockThreshold",
  userChangeTenant: "userChangeTenant",
  activateCluster: "activateCluster",
  deactivateCluster: "deactivateCluster",
  customEvent: "customEvent",
  mergeFileChunks: "mergeFileChunks",
};

