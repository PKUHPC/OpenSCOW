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

export enum OperationType {
  login = "login",
  logout = "logout",
  submitJob = "submitJob",
  endJob = "endJob",
  userSetJobTimeLimit = "userSetJobTimeLimit",
  addJobTemplate = "addJobTemplate",
  deleteJobTemplate = "deleteJobTemplate",
  updateJobTemplate = "updateJobTemplate",
  shellLogin = "shellLogin",
  createDesktop = "createDesktop",
  deleteDesktop = "deleteDesktop",
  createApp = "createApp",
  endApp = "endApp",
  createFile = "createFile",
  deleteFile = "deleteFile",
  uploadFile = "uploadFile",
  createDirectory = "createDirectory",
  deleteDirectory = "deleteDirectory",
  renameFile = "renameFile",
  renameDirectory = "renameDirectory",
  moveFile = "moveFile",
  moveDirectory = "moveDirectory",
  copyFile = "copyFile",
  copyDirectory = "copyDirectory",
  accountSetJobTimeLimit = "accountSetJobTimeLimit",
  createUser = "createUser",
  addUserToAccount = "addUserToAccount",
  removeUserFromAccount = "removeUserFromAccount",
  setAccountAdmin = "setAccountAdmin",
  unsetAccountAdmin = "unsetAccountAdmin",
  blockUser = "blockUser",
  unblockUser = "unblockUser",
  accountSetChargeLimit = "accountSetChargeLimit",
  tenantSetJobTimeLimit = "tenantSetJobTimeLimit",
  setTenantBilling = "setTenantBilling",
  setTenantAdmin = "setTenantAdmin",
  unsetTenantAdmin = "unsetTenantAdmin",
  setTenantFinance = "setTenantFinance",
  unsetTenantFinance = "unsetTenantFinance",
  tenantChangePassword = "tenantChangePassword",
  createAccount = "createAccount",
  addAccountToWhitelist = "addAccountToWhitelist",
  removeAccountFromWhitelist = "removeAccountFromWhitelist",
  accountPay = "accountPay",
  importUsers = "importUsers",
  setPlatformAdmin = "setPlatformAdmin",
  unsetPlatformAdmin = "unsetPlatformAdmin",
  setPlatformFinance = "setPlatformFinance",
  unsetPlatformFinance = "unsetPlatformFinance",
  platformChangePassword = "platformChangePassword",
  setPlatformBilling = "setPlatformBilling",
  createTenant = "createTenant",
  platformSetTenantBilling = "platformSetTenantBilling",
  tenantPay = "tenantPay"
}

export const OperationCodeMap = {
  [OperationType.login]: "000001",
  [OperationType.logout]: "000002",
  [OperationType.submitJob]: "010101",
  [OperationType.endJob]: "010102",
  // TODO
};
