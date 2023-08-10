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

import { ValueOf } from "next/dist/shared/lib/constants";

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
  USER_SET_JOB_TIME_LIMIT: "userSetJobTimeLimit",
  ADD_JOB_TEMPLATE: "addJobTemplate",
  DELETE_JOB_TEMPLATE: "deleteJobTemplate",
  UPDATE_JOB_TEMPLATE: "updateJobTemplate",
  SHELL_LOGIN: "shellLogin",
  CREATE_DESKTOP: "createDesktop",
  DELETE_DESKTOP: "deleteDesktop",
  CREATE_APP: "createApp",
  END_APP: "endApp",
  CREATE_FILE: "createFile",
  DELETE_FILE: "deleteFile",
  UPLOAD_FILE: "uploadFile",
  CREATE_DIRECTORY: "createDirectory",
  DELETE_DIRECTORY: "deleteDirectory",
  RENAME_FILE: "renameFile",
  RENAME_DIRECTORY: "renameDirectory",
  MOVE_FILE: "moveFile",
  MOVE_DIRECTORY: "moveDirectory",
  COPY_FILE: "copyFile",
  COPY_DIRECTORY: "copyDirectory",
  // MIS
  ACCOUNT_SET_JOB_TIME_LIMIT: "accountSetJobTimeLimit",
  CREATE_USER: "createUser",
  ADD_USER_TO_ACCOUNT: "addUserToAccount",
  REMOVE_USER_FROM_ACCOUNT: "removeUserFromAccount",
  SET_ACCOUNT_ADMIN: "setAccountAdmin",
  UNSET_ACCOUNT_ADMIN: "unsetAccountAdmin",
  BLOCK_USER: "blockUser",
  UNBLOCK_USER: "unblockUser",
  ACCOUNT_SET_CHARGE_LIMIT: "accountSetChargeLimit",
  TENANT_SET_JOB_TIME_LIMIT: "tenantSetJobTimeLimit",
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
