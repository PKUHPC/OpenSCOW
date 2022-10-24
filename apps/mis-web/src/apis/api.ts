/* eslint-disable max-len */

import { fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { join } from "path";


import type { ChangeJobPriceSchema } from "src/pages/api/admin/changeJobPrice";
import type { ChangeStorageQuotaSchema } from "src/pages/api/admin/changeStorage";
import type { FetchJobsSchema } from "src/pages/api/admin\fetchJobs/fetchJobs";
import type { GetFetchJobInfoSchema } from "src/pages/api/admin\fetchJobs/getFetchInfo";
import type { SetFetchStateSchema } from "src/pages/api/admin\fetchJobs/setFetchState";
import type { TenantFinancePaySchema } from "src/pages/api/admin\finance/pay";
import type { GetTenantPaymentsSchema } from "src/pages/api/admin\finance/payments";
import type { GetAllTenantsSchema } from "src/pages/api/admin/getAllTenants";
import type { GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
import type { GetTenantUsersSchema } from "src/pages/api/admin/getTenantUsers";
import type { ImportUsersSchema } from "src/pages/api/admin/importUsers";
import type { QueryStorageQuotaSchema } from "src/pages/api/admin/queryStorageQuota";
import type { SetPlatformRoleSchema } from "src/pages/api/admin/setPlatformRole";
import type { SetTenantRoleSchema } from "src/pages/api/admin/setTenantRole";
import type { UnsetPlatformRoleSchema } from "src/pages/api/admin/unsetPlatformRole";
import type { UnsetTenantRoleSchema } from "src/pages/api/admin/unsetTenantRole";
import type { AuthCallbackSchema } from "src/pages/api/auth/callback";
import type { LogoutSchema } from "src/pages/api/auth/logout";
import type { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import type { GetUserStatusSchema } from "src/pages/api/dashboard/status";
import type { GetChargesSchema } from "src/pages/api/finance/charges";
import type { GetUsedPayTypesSchema } from "src/pages/api/finance/getUsedPayTypes";
import type { FinancePaySchema } from "src/pages/api/finance/pay";
import type { GetPaymentsSchema } from "src/pages/api/finance/payments";
import type { GetIconSchema } from "src/pages/api//icon";
import type { CompleteInitSchema } from "src/pages/api/init/completeInit";
import type { CreateInitAdminSchema } from "src/pages/api/init/createInitAdmin";
import type { InitGetAccountsSchema } from "src/pages/api/init/getAccounts";
import type { InitGetUsersSchema } from "src/pages/api/init/getUsers";
import type { SetAsInitAdminSchema } from "src/pages/api/init/setAsInitAdmin copy";
import type { UnsetInitAdminSchema } from "src/pages/api/init/setAsInitAdmin";
import type { AddBillingItemSchema } from "src/pages/api/job/addBillingItem";
import type { ChangeJobTimeLimitSchema } from "src/pages/api/job/changeJobTimeLimit";
import type { GetBillingItemsSchema } from "src/pages/api/job/getBillingItems";
import type { GetBillingTableSchema } from "src/pages/api/job/getBillingTable";
import type { GetJobByBiJobIndexSchema } from "src/pages/api/job/getJobByBiJobIndex";
import type { GetJobInfoSchema } from "src/pages/api/job/jobInfo";
import type { QueryJobTimeLimitSchema } from "src/pages/api/job/queryJobTimeLimit";
import type { GetRunningJobsSchema } from "src/pages/api/job/runningJobs";
import type { ChangePasswordSchema } from "src/pages/api/profile/changePassword";
import type { DewhitelistAccountSchema } from "src/pages/api/tenant\accountWhitelist/dewhitelistAccount";
import type { GetWhitelistedAccountsSchema } from "src/pages/api/tenant\accountWhitelist/getWhitelistedAccounts";
import type { WhitelistAccountSchema } from "src/pages/api/tenant\accountWhitelist/whitelistAccount";
import type { CreateAccountSchema } from "src/pages/api/tenant/createAccount";
import type { GetAccountsSchema } from "src/pages/api/tenant/getAccounts";
import type { GetTenantsSchema } from "src/pages/api/tenant/getTenants";
import type { AddUserToAccountSchema } from "src/pages/api/users/addToAccount";
import type { BlockUserInAccountSchema } from "src/pages/api/users/blockInAccount";
import type { CreateUserSchema } from "src/pages/api/users/create";
import type { GetAccountUsersSchema } from "src/pages/api/users/index";
import type { CancelJobChargeLimitSchema } from "src/pages/api/users\jobChargeLimit/cancel";
import type { SetJobChargeLimitSchema } from "src/pages/api/users\jobChargeLimit/set";
import type { RemoveUserFromAccountSchema } from "src/pages/api/users/removeFromAccount";
import type { SetAdminSchema } from "src/pages/api/users/setAsAdmin";
import type { QueryStorageUsageSchema } from "src/pages/api/users/storageUsage";
import type { UnblockUserInAccountSchema } from "src/pages/api/users/unblockInAccount";
import type { UnsetAdminSchema } from "src/pages/api/users/unsetAdmin";


export const api = {
  changeJobPrice: fromApi<ChangeJobPriceSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/changeJobPrice")),
  changeStorageQuota: fromApi<ChangeStorageQuotaSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/changeStorage")),
  fetchJobs: fromApi<FetchJobsSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin\fetchJobs/fetchJobs")),
  getFetchJobInfo: fromApi<GetFetchJobInfoSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin\fetchJobs/getFetchInfo")),
  setFetchState: fromApi<SetFetchStateSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin\fetchJobs/setFetchState")),
  tenantFinancePay: fromApi<TenantFinancePaySchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin\finance/pay")),
  getTenantPayments: fromApi<GetTenantPaymentsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin\finance/payments")),
  getAllTenants: fromApi<GetAllTenantsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/getAllTenants")),
  getAllUsers: fromApi<GetAllUsersSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/getAllUsers")),
  getTenantUsers: fromApi<GetTenantUsersSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/getTenantUsers")),
  importUsers: fromApi<ImportUsersSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/importUsers")),
  queryStorageQuota: fromApi<QueryStorageQuotaSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/queryStorageQuota")),
  setPlatformRole: fromApi<SetPlatformRoleSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/setPlatformRole")),
  setTenantRole: fromApi<SetTenantRoleSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/setTenantRole")),
  unsetPlatformRole: fromApi<UnsetPlatformRoleSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/unsetPlatformRole")),
  unsetTenantRole: fromApi<UnsetTenantRoleSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/unsetTenantRole")),
  authCallback: fromApi<AuthCallbackSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/callback")),
  logout: fromApi<LogoutSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/logout")),
  validateToken: fromApi<ValidateTokenSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/validateToken")),
  getUserStatus: fromApi<GetUserStatusSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/dashboard/status")),
  getCharges: fromApi<GetChargesSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/finance/charges")),
  getUsedPayTypes: fromApi<GetUsedPayTypesSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/finance/getUsedPayTypes")),
  financePay: fromApi<FinancePaySchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/finance/pay")),
  getPayments: fromApi<GetPaymentsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/finance/payments")),
  getIcon: fromApi<GetIconSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api//icon")),
  completeInit: fromApi<CompleteInitSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/init/completeInit")),
  createInitAdmin: fromApi<CreateInitAdminSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/init/createInitAdmin")),
  initGetAccounts: fromApi<InitGetAccountsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/init/getAccounts")),
  initGetUsers: fromApi<InitGetUsersSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/init/getUsers")),
  setAsInitAdmin: fromApi<SetAsInitAdminSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/init/setAsInitAdmin copy")),
  unsetInitAdmin: fromApi<UnsetInitAdminSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/init/setAsInitAdmin")),
  addBillingItem: fromApi<AddBillingItemSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/addBillingItem")),
  changeJobTimeLimit: fromApi<ChangeJobTimeLimitSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/changeJobTimeLimit")),
  getBillingItems: fromApi<GetBillingItemsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getBillingItems")),
  getBillingTable: fromApi<GetBillingTableSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getBillingTable")),
  getJobByBiJobIndex: fromApi<GetJobByBiJobIndexSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getJobByBiJobIndex")),
  getJobInfo: fromApi<GetJobInfoSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/jobInfo")),
  queryJobTimeLimit: fromApi<QueryJobTimeLimitSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/queryJobTimeLimit")),
  getRunningJobs: fromApi<GetRunningJobsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/runningJobs")),
  changePassword: fromApi<ChangePasswordSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/profile/changePassword")),
  dewhitelistAccount: fromApi<DewhitelistAccountSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant\accountWhitelist/dewhitelistAccount")),
  getWhitelistedAccounts: fromApi<GetWhitelistedAccountsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant\accountWhitelist/getWhitelistedAccounts")),
  whitelistAccount: fromApi<WhitelistAccountSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant\accountWhitelist/whitelistAccount")),
  createAccount: fromApi<CreateAccountSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant/createAccount")),
  getAccounts: fromApi<GetAccountsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant/getAccounts")),
  getTenants: fromApi<GetTenantsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant/getTenants")),
  addUserToAccount: fromApi<AddUserToAccountSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/addToAccount")),
  blockUserInAccount: fromApi<BlockUserInAccountSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/blockInAccount")),
  createUser: fromApi<CreateUserSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/create")),
  getAccountUsers: fromApi<GetAccountUsersSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users")),
  cancelJobChargeLimit: fromApi<CancelJobChargeLimitSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users\jobChargeLimit/cancel")),
  setJobChargeLimit: fromApi<SetJobChargeLimitSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users\jobChargeLimit/set")),
  removeUserFromAccount: fromApi<RemoveUserFromAccountSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/removeFromAccount")),
  setAdmin: fromApi<SetAdminSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/setAsAdmin")),
  queryStorageUsage: fromApi<QueryStorageUsageSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/storageUsage")),
  unblockUserInAccount: fromApi<UnblockUserInAccountSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/unblockInAccount")),
  unsetAdmin: fromApi<UnsetAdminSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/unsetAdmin")),
};
  