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

import { apiClient } from "src/apis/client";
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
import type { ChangeEmailSchema } from "src/pages/api/profile/changeEmail";
import type { ChangePasswordSchema } from "src/pages/api/profile/changePassword";
import checkPassword, { CheckPasswordSchema } from "src/pages/api/profile/checkPassword";
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


export const api = {
  changeJobPrice: apiClient.fromTypeboxRoute<typeof ChangeJobPriceSchema>("PATCH", "/api/admin/changeJobPrice"),
  changePasswordAsPlatformAdmin: apiClient.fromTypeboxRoute<typeof ChangePasswordAsPlatformAdminSchema>("PATCH", "/api/admin/changePassword"),
  changeStorageQuota: apiClient.fromTypeboxRoute<typeof ChangeStorageQuotaSchema>("PUT", "/api/admin/changeStorage"),
  fetchJobs: apiClient.fromTypeboxRoute<typeof FetchJobsSchema>("POST", "/api/admin/fetchJobs/fetchJobs"),
  getFetchJobInfo: apiClient.fromTypeboxRoute<typeof GetFetchJobInfoSchema>("GET", "/api/admin/fetchJobs/getFetchInfo"),
  setFetchState: apiClient.fromTypeboxRoute<typeof SetFetchStateSchema>("POST", "/api/admin/fetchJobs/setFetchState"),
  tenantFinancePay: apiClient.fromTypeboxRoute<typeof TenantFinancePaySchema>("POST", "/api/admin/finance/pay"),
  getTenantPayments: apiClient.fromTypeboxRoute<typeof GetTenantPaymentsSchema>("GET", "/api/admin/finance/payments"),
  getAllTenants: apiClient.fromTypeboxRoute<typeof GetAllTenantsSchema>("GET", "/api/admin/getAllTenants"),
  getAllUsers: apiClient.fromTypeboxRoute<typeof GetAllUsersSchema>("GET", "/api/admin/getAllUsers"),
  getClusterUsers: apiClient.fromTypeboxRoute<typeof GetClusterUsersSchema>("GET", "/api/admin/getClusterUsers"),
  getTenantUsers: apiClient.fromTypeboxRoute<typeof GetTenantUsersSchema>("GET", "/api/admin/getTenantUsers"),
  importUsers: apiClient.fromTypeboxRoute<typeof ImportUsersSchema>("POST", "/api/admin/importUsers"),
  queryStorageQuota: apiClient.fromTypeboxRoute<typeof QueryStorageQuotaSchema>("GET", "/api/admin/queryStorageQuota"),
  setPlatformRole: apiClient.fromTypeboxRoute<typeof SetPlatformRoleSchema>("PUT", "/api/admin/setPlatformRole"),
  setTenantRole: apiClient.fromTypeboxRoute<typeof SetTenantRoleSchema>("PUT", "/api/admin/setTenantRole"),
  unsetPlatformRole: apiClient.fromTypeboxRoute<typeof UnsetPlatformRoleSchema>("PUT", "/api/admin/unsetPlatformRole"),
  unsetTenantRole: apiClient.fromTypeboxRoute<typeof UnsetTenantRoleSchema>("PUT", "/api/admin/unsetTenantRole"),
  updateBlockStatus: apiClient.fromTypeboxRoute<typeof UpdateBlockStatusSchema>("PUT", "/api/admin/updateBlockStatus"),
  authCallback: apiClient.fromTypeboxRoute<typeof AuthCallbackSchema>("GET", "/api/auth/callback"),
  logout: apiClient.fromTypeboxRoute<typeof LogoutSchema>("DELETE", "/api/auth/logout"),
  validateToken: apiClient.fromTypeboxRoute<typeof ValidateTokenSchema>("GET", "/api/auth/validateToken"),
  getUserStatus: apiClient.fromTypeboxRoute<typeof GetUserStatusSchema>("GET", "/api/dashboard/status"),
  getCharges: apiClient.fromTypeboxRoute<typeof GetChargesSchema>("GET", "/api/finance/charges"),
  getUsedPayTypes: apiClient.fromTypeboxRoute<typeof GetUsedPayTypesSchema>("GET", "/api/finance/getUsedPayTypes"),
  financePay: apiClient.fromTypeboxRoute<typeof FinancePaySchema>("POST", "/api/finance/pay"),
  getPayments: apiClient.fromTypeboxRoute<typeof GetPaymentsSchema>("GET", "/api/finance/payments"),
  completeInit: apiClient.fromTypeboxRoute<typeof CompleteInitSchema>("POST", "/api/init/completeInit"),
  createInitAdmin: apiClient.fromTypeboxRoute<typeof CreateInitAdminSchema>("POST", "/api/init/createInitAdmin"),
  initGetAccounts: apiClient.fromTypeboxRoute<typeof InitGetAccountsSchema>("GET", "/api/init/getAccounts"),
  initGetUsers: apiClient.fromTypeboxRoute<typeof InitGetUsersSchema>("GET", "/api/init/getUsers"),
  setAsInitAdmin: apiClient.fromTypeboxRoute<typeof SetAsInitAdminSchema>("PATCH", "/api/init/setAsInitAdmin copy"),
  unsetInitAdmin: apiClient.fromTypeboxRoute<typeof UnsetInitAdminSchema>("DELETE", "/api/init/setAsInitAdmin"),
  userExists: apiClient.fromTypeboxRoute<typeof UserExistsSchema>("POST", "/api/init/userExists"),
  addBillingItem: apiClient.fromTypeboxRoute<typeof AddBillingItemSchema>("POST", "/api/job/addBillingItem"),
  changeJobTimeLimit: apiClient.fromTypeboxRoute<typeof ChangeJobTimeLimitSchema>("PATCH", "/api/job/changeJobTimeLimit"),
  getBillingItems: apiClient.fromTypeboxRoute<typeof GetBillingItemsSchema>("GET", "/api/job/getBillingItems"),
  getBillingTable: apiClient.fromTypeboxRoute<typeof GetBillingTableSchema>("GET", "/api/job/getBillingTable"),
  getJobByBiJobIndex: apiClient.fromTypeboxRoute<typeof GetJobByBiJobIndexSchema>("GET", "/api/job/getJobByBiJobIndex"),
  getMissingDefaultPriceItems: apiClient.fromTypeboxRoute<typeof GetMissingDefaultPriceItemsSchema>("GET", "/api/job/getMissingDefaultPriceItems"),
  getJobInfo: apiClient.fromTypeboxRoute<typeof GetJobInfoSchema>("GET", "/api/job/jobInfo"),
  queryJobTimeLimit: apiClient.fromTypeboxRoute<typeof QueryJobTimeLimitSchema>("GET", "/api/job/queryJobTimeLimit"),
  getRunningJobs: apiClient.fromTypeboxRoute<typeof GetRunningJobsSchema>("GET", "/api/job/runningJobs"),
  changePassword: apiClient.fromTypeboxRoute<typeof ChangePasswordSchema>("PATCH", "/api/profile/changePassword"),
  changeEmail: apiClient.fromTypeboxRoute<typeof ChangeEmailSchema>("PATCH", "/api/profile/changeEmail"),
  dewhitelistAccount: apiClient.fromTypeboxRoute<typeof DewhitelistAccountSchema>("DELETE", "/api/tenant/accountWhitelist/dewhitelistAccount"),
  getWhitelistedAccounts: apiClient.fromTypeboxRoute<typeof GetWhitelistedAccountsSchema>("GET", "/api/tenant/accountWhitelist/getWhitelistedAccounts"),
  whitelistAccount: apiClient.fromTypeboxRoute<typeof WhitelistAccountSchema>("PUT", "/api/tenant/accountWhitelist/whitelistAccount"),
  changePasswordAsTenantAdmin: apiClient.fromTypeboxRoute<typeof ChangePasswordAsTenantAdminSchema>("PATCH", "/api/tenant/changePassword"),
  createTenant: apiClient.fromTypeboxRoute<typeof CreateTenantSchema>("POST", "/api/tenant/create"),
  createAccount: apiClient.fromTypeboxRoute<typeof CreateAccountSchema>("POST", "/api/tenant/createAccount"),
  getAccounts: apiClient.fromTypeboxRoute<typeof GetAccountsSchema>("GET", "/api/tenant/getAccounts"),
  getTenants: apiClient.fromTypeboxRoute<typeof GetTenantsSchema>("GET", "/api/tenant/getTenants"),
  addUserToAccount: apiClient.fromTypeboxRoute<typeof AddUserToAccountSchema>("POST", "/api/users/addToAccount"),
  blockUserInAccount: apiClient.fromTypeboxRoute<typeof BlockUserInAccountSchema>("PUT", "/api/users/blockInAccount"),
  createUser: apiClient.fromTypeboxRoute<typeof CreateUserSchema>("POST", "/api/users/create"),
  getAccountUsers: apiClient.fromTypeboxRoute<typeof GetAccountUsersSchema>("GET", "/api/users"),
  cancelJobChargeLimit: apiClient.fromTypeboxRoute<typeof CancelJobChargeLimitSchema>("DELETE", "/api/users/jobChargeLimit/cancel"),
  setJobChargeLimit: apiClient.fromTypeboxRoute<typeof SetJobChargeLimitSchema>("PUT", "/api/users/jobChargeLimit/set"),
  removeUserFromAccount: apiClient.fromTypeboxRoute<typeof RemoveUserFromAccountSchema>("DELETE", "/api/users/removeFromAccount"),
  setAdmin: apiClient.fromTypeboxRoute<typeof SetAdminSchema>("PUT", "/api/users/setAsAdmin"),
  queryStorageUsage: apiClient.fromTypeboxRoute<typeof QueryStorageUsageSchema>("GET", "/api/users/storageUsage"),
  unblockUserInAccount: apiClient.fromTypeboxRoute<typeof UnblockUserInAccountSchema>("PUT", "/api/users/unblockInAccount"),
  unsetAdmin: apiClient.fromTypeboxRoute<typeof UnsetAdminSchema>("PUT", "/api/users/unsetAdmin"),
  checkPassword: apiClient.fromTypeboxRoute<typeof CheckPasswordSchema>("GET", "/api/profile/checkPassword"),
};
