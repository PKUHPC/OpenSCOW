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

/* eslint-disable max-len */

import { fromTypeboxRoute } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { join } from "path";
import type { ChangeJobPriceSchema } from "src/pages/api/admin/changeJobPrice";
import type { ChangePasswordAsPlatformAdminSchema } from "src/pages/api/admin/changePassword";
import type { ChangeStorageQuotaSchema } from "src/pages/api/admin/changeStorage";
import type { FetchJobsSchema } from "src/pages/api/admin/fetchJobs/fetchJobs";
import type { GetFetchJobInfoSchema } from "src/pages/api/admin/fetchJobs/getFetchInfo";
import type { SetFetchStateSchema } from "src/pages/api/admin/fetchJobs/setFetchState";
import type { TenantFinancePaySchema } from "src/pages/api/admin/finance/pay";
import type { GetTenantPaymentsSchema } from "src/pages/api/admin/finance/payments";
import type { GetAllTenantsSchema } from "src/pages/api/admin/getAllTenants";
import type { GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
import type { GetClusterUsersSchema } from "src/pages/api/admin/getClusterUsers";
import type { GetTenantUsersSchema } from "src/pages/api/admin/getTenantUsers";
import type { ImportUsersSchema } from "src/pages/api/admin/importUsers";
import type { QueryStorageQuotaSchema } from "src/pages/api/admin/queryStorageQuota";
import type { SetPlatformRoleSchema } from "src/pages/api/admin/setPlatformRole";
import type { SetTenantRoleSchema } from "src/pages/api/admin/setTenantRole";
import type { UnsetPlatformRoleSchema } from "src/pages/api/admin/unsetPlatformRole";
import type { UnsetTenantRoleSchema } from "src/pages/api/admin/unsetTenantRole";
import type { UpdateBlockStatusSchema } from "src/pages/api/admin/updateBlockStatus";
import type { AuthCallbackSchema } from "src/pages/api/auth/callback";
import type { LogoutSchema } from "src/pages/api/auth/logout";
import type { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import type { GetUserStatusSchema } from "src/pages/api/dashboard/status";
import type { GetChargesSchema } from "src/pages/api/finance/charges";
import type { GetUsedPayTypesSchema } from "src/pages/api/finance/getUsedPayTypes";
import type { FinancePaySchema } from "src/pages/api/finance/pay";
import type { GetPaymentsSchema } from "src/pages/api/finance/payments";
import type { CompleteInitSchema } from "src/pages/api/init/completeInit";
import type { CreateInitAdminSchema } from "src/pages/api/init/createInitAdmin";
import type { InitGetAccountsSchema } from "src/pages/api/init/getAccounts";
import type { InitGetUsersSchema } from "src/pages/api/init/getUsers";
import type { UnsetInitAdminSchema } from "src/pages/api/init/setAsInitAdmin";
import type { SetAsInitAdminSchema } from "src/pages/api/init/setAsInitAdmin copy";
import type { UserExistsSchema } from "src/pages/api/init/userExists";
import type { AddBillingItemSchema } from "src/pages/api/job/addBillingItem";
import type { ChangeJobTimeLimitSchema } from "src/pages/api/job/changeJobTimeLimit";
import type { GetBillingItemsSchema } from "src/pages/api/job/getBillingItems";
import type { GetBillingTableSchema } from "src/pages/api/job/getBillingTable";
import type { GetJobByBiJobIndexSchema } from "src/pages/api/job/getJobByBiJobIndex";
import type { GetMissingDefaultPriceItemsSchema } from "src/pages/api/job/getMissingDefaultPriceItems";
import type { GetJobInfoSchema } from "src/pages/api/job/jobInfo";
import type { QueryJobTimeLimitSchema } from "src/pages/api/job/queryJobTimeLimit";
import type { GetRunningJobsSchema } from "src/pages/api/job/runningJobs";
import type { ChangePasswordSchema } from "src/pages/api/profile/changePassword";
import type { DewhitelistAccountSchema } from "src/pages/api/tenant/accountWhitelist/dewhitelistAccount";
import type { GetWhitelistedAccountsSchema } from "src/pages/api/tenant/accountWhitelist/getWhitelistedAccounts";
import type { WhitelistAccountSchema } from "src/pages/api/tenant/accountWhitelist/whitelistAccount";
import type { ChangePasswordAsTenantAdminSchema } from "src/pages/api/tenant/changePassword";
import type { CreateTenantSchema } from "src/pages/api/tenant/create";
import type { CreateAccountSchema } from "src/pages/api/tenant/createAccount";
import type { GetAccountsSchema } from "src/pages/api/tenant/getAccounts";
import type { GetTenantsSchema } from "src/pages/api/tenant/getTenants";
import type { AddUserToAccountSchema } from "src/pages/api/users/addToAccount";
import type { BlockUserInAccountSchema } from "src/pages/api/users/blockInAccount";
import type { CreateUserSchema } from "src/pages/api/users/create";
import type { GetAccountUsersSchema } from "src/pages/api/users/index";
import type { CancelJobChargeLimitSchema } from "src/pages/api/users/jobChargeLimit/cancel";
import type { SetJobChargeLimitSchema } from "src/pages/api/users/jobChargeLimit/set";
import type { RemoveUserFromAccountSchema } from "src/pages/api/users/removeFromAccount";
import type { SetAdminSchema } from "src/pages/api/users/setAsAdmin";
import type { QueryStorageUsageSchema } from "src/pages/api/users/storageUsage";
import type { UnblockUserInAccountSchema } from "src/pages/api/users/unblockInAccount";
import type { UnsetAdminSchema } from "src/pages/api/users/unsetAdmin";
import { publicConfig } from "src/utils/config";

const basePath = publicConfig.BASE_PATH || "";


export const api = {
  changeJobPrice: fromTypeboxRoute<typeof ChangeJobPriceSchema>("PATCH", join(basePath, "/api/admin/changeJobPrice")),
  changePasswordAsPlatformAdmin: fromTypeboxRoute<typeof ChangePasswordAsPlatformAdminSchema>("PATCH", join(basePath, "/api/admin/changePassword")),
  changeStorageQuota: fromTypeboxRoute<typeof ChangeStorageQuotaSchema>("PUT", join(basePath, "/api/admin/changeStorage")),
  fetchJobs: fromTypeboxRoute<typeof FetchJobsSchema>("POST", join(basePath, "/api/admin/fetchJobs/fetchJobs")),
  getFetchJobInfo: fromTypeboxRoute<typeof GetFetchJobInfoSchema>("GET", join(basePath, "/api/admin/fetchJobs/getFetchInfo")),
  setFetchState: fromTypeboxRoute<typeof SetFetchStateSchema>("POST", join(basePath, "/api/admin/fetchJobs/setFetchState")),
  tenantFinancePay: fromTypeboxRoute<typeof TenantFinancePaySchema>("POST", join(basePath, "/api/admin/finance/pay")),
  getTenantPayments: fromTypeboxRoute<typeof GetTenantPaymentsSchema>("GET", join(basePath, "/api/admin/finance/payments")),
  getAllTenants: fromTypeboxRoute<typeof GetAllTenantsSchema>("GET", join(basePath, "/api/admin/getAllTenants")),
  getAllUsers: fromTypeboxRoute<typeof GetAllUsersSchema>("GET", join(basePath, "/api/admin/getAllUsers")),
  getClusterUsers: fromTypeboxRoute<typeof GetClusterUsersSchema>("GET", join(basePath, "/api/admin/getClusterUsers")),
  getTenantUsers: fromTypeboxRoute<typeof GetTenantUsersSchema>("GET", join(basePath, "/api/admin/getTenantUsers")),
  importUsers: fromTypeboxRoute<typeof ImportUsersSchema>("POST", join(basePath, "/api/admin/importUsers")),
  queryStorageQuota: fromTypeboxRoute<typeof QueryStorageQuotaSchema>("GET", join(basePath, "/api/admin/queryStorageQuota")),
  setPlatformRole: fromTypeboxRoute<typeof SetPlatformRoleSchema>("PUT", join(basePath, "/api/admin/setPlatformRole")),
  setTenantRole: fromTypeboxRoute<typeof SetTenantRoleSchema>("PUT", join(basePath, "/api/admin/setTenantRole")),
  unsetPlatformRole: fromTypeboxRoute<typeof UnsetPlatformRoleSchema>("PUT", join(basePath, "/api/admin/unsetPlatformRole")),
  unsetTenantRole: fromTypeboxRoute<typeof UnsetTenantRoleSchema>("PUT", join(basePath, "/api/admin/unsetTenantRole")),
  updateBlockStatus: fromTypeboxRoute<typeof UpdateBlockStatusSchema>("PUT", join(basePath, "/api/admin/updateBlockStatus")),
  authCallback: fromTypeboxRoute<typeof AuthCallbackSchema>("GET", join(basePath, "/api/auth/callback")),
  logout: fromTypeboxRoute<typeof LogoutSchema>("DELETE", join(basePath, "/api/auth/logout")),
  validateToken: fromTypeboxRoute<typeof ValidateTokenSchema>("GET", join(basePath, "/api/auth/validateToken")),
  getUserStatus: fromTypeboxRoute<typeof GetUserStatusSchema>("GET", join(basePath, "/api/dashboard/status")),
  getCharges: fromTypeboxRoute<typeof GetChargesSchema>("GET", join(basePath, "/api/finance/charges")),
  getUsedPayTypes: fromTypeboxRoute<typeof GetUsedPayTypesSchema>("GET", join(basePath, "/api/finance/getUsedPayTypes")),
  financePay: fromTypeboxRoute<typeof FinancePaySchema>("POST", join(basePath, "/api/finance/pay")),
  getPayments: fromTypeboxRoute<typeof GetPaymentsSchema>("GET", join(basePath, "/api/finance/payments")),
  completeInit: fromTypeboxRoute<typeof CompleteInitSchema>("POST", join(basePath, "/api/init/completeInit")),
  createInitAdmin: fromTypeboxRoute<typeof CreateInitAdminSchema>("POST", join(basePath, "/api/init/createInitAdmin")),
  initGetAccounts: fromTypeboxRoute<typeof InitGetAccountsSchema>("GET", join(basePath, "/api/init/getAccounts")),
  initGetUsers: fromTypeboxRoute<typeof InitGetUsersSchema>("GET", join(basePath, "/api/init/getUsers")),
  setAsInitAdmin: fromTypeboxRoute<typeof SetAsInitAdminSchema>("PATCH", join(basePath, "/api/init/setAsInitAdmin copy")),
  unsetInitAdmin: fromTypeboxRoute<typeof UnsetInitAdminSchema>("DELETE", join(basePath, "/api/init/setAsInitAdmin")),
  userExists: fromTypeboxRoute<typeof UserExistsSchema>("POST", join(basePath, "/api/init/userExists")),
  addBillingItem: fromTypeboxRoute<typeof AddBillingItemSchema>("POST", join(basePath, "/api/job/addBillingItem")),
  changeJobTimeLimit: fromTypeboxRoute<typeof ChangeJobTimeLimitSchema>("PATCH", join(basePath, "/api/job/changeJobTimeLimit")),
  getBillingItems: fromTypeboxRoute<typeof GetBillingItemsSchema>("GET", join(basePath, "/api/job/getBillingItems")),
  getBillingTable: fromTypeboxRoute<typeof GetBillingTableSchema>("GET", join(basePath, "/api/job/getBillingTable")),
  getJobByBiJobIndex: fromTypeboxRoute<typeof GetJobByBiJobIndexSchema>("GET", join(basePath, "/api/job/getJobByBiJobIndex")),
  getMissingDefaultPriceItems: fromTypeboxRoute<typeof GetMissingDefaultPriceItemsSchema>("GET", join(basePath, "/api/job/getMissingDefaultPriceItems")),
  getJobInfo: fromTypeboxRoute<typeof GetJobInfoSchema>("GET", join(basePath, "/api/job/jobInfo")),
  queryJobTimeLimit: fromTypeboxRoute<typeof QueryJobTimeLimitSchema>("GET", join(basePath, "/api/job/queryJobTimeLimit")),
  getRunningJobs: fromTypeboxRoute<typeof GetRunningJobsSchema>("GET", join(basePath, "/api/job/runningJobs")),
  changePassword: fromTypeboxRoute<typeof ChangePasswordSchema>("PATCH", join(basePath, "/api/profile/changePassword")),
  dewhitelistAccount: fromTypeboxRoute<typeof DewhitelistAccountSchema>("DELETE", join(basePath, "/api/tenant/accountWhitelist/dewhitelistAccount")),
  getWhitelistedAccounts: fromTypeboxRoute<typeof GetWhitelistedAccountsSchema>("GET", join(basePath, "/api/tenant/accountWhitelist/getWhitelistedAccounts")),
  whitelistAccount: fromTypeboxRoute<typeof WhitelistAccountSchema>("PUT", join(basePath, "/api/tenant/accountWhitelist/whitelistAccount")),
  changePasswordAsTenantAdmin: fromTypeboxRoute<typeof ChangePasswordAsTenantAdminSchema>("PATCH", join(basePath, "/api/tenant/changePassword")),
  createTenant: fromTypeboxRoute<typeof CreateTenantSchema>("POST", join(basePath, "/api/tenant/create")),
  createAccount: fromTypeboxRoute<typeof CreateAccountSchema>("POST", join(basePath, "/api/tenant/createAccount")),
  getAccounts: fromTypeboxRoute<typeof GetAccountsSchema>("GET", join(basePath, "/api/tenant/getAccounts")),
  getTenants: fromTypeboxRoute<typeof GetTenantsSchema>("GET", join(basePath, "/api/tenant/getTenants")),
  addUserToAccount: fromTypeboxRoute<typeof AddUserToAccountSchema>("POST", join(basePath, "/api/users/addToAccount")),
  blockUserInAccount: fromTypeboxRoute<typeof BlockUserInAccountSchema>("PUT", join(basePath, "/api/users/blockInAccount")),
  createUser: fromTypeboxRoute<typeof CreateUserSchema>("POST", join(basePath, "/api/users/create")),
  getAccountUsers: fromTypeboxRoute<typeof GetAccountUsersSchema>("GET", join(basePath, "/api/users")),
  cancelJobChargeLimit: fromTypeboxRoute<typeof CancelJobChargeLimitSchema>("DELETE", join(basePath, "/api/users/jobChargeLimit/cancel")),
  setJobChargeLimit: fromTypeboxRoute<typeof SetJobChargeLimitSchema>("PUT", join(basePath, "/api/users/jobChargeLimit/set")),
  removeUserFromAccount: fromTypeboxRoute<typeof RemoveUserFromAccountSchema>("DELETE", join(basePath, "/api/users/removeFromAccount")),
  setAdmin: fromTypeboxRoute<typeof SetAdminSchema>("PUT", join(basePath, "/api/users/setAsAdmin")),
  queryStorageUsage: fromTypeboxRoute<typeof QueryStorageUsageSchema>("GET", join(basePath, "/api/users/storageUsage")),
  unblockUserInAccount: fromTypeboxRoute<typeof UnblockUserInAccountSchema>("PUT", join(basePath, "/api/users/unblockInAccount")),
  unsetAdmin: fromTypeboxRoute<typeof UnsetAdminSchema>("PUT", join(basePath, "/api/users/unsetAdmin")),
};
