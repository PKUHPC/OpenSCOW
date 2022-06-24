/* eslint-disable max-len */

import { fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { join } from "path";
import type { GetIconSchema } from "src/pages/api//icon";
import type { ChangeJobPriceSchema } from "src/pages/api/admin/changeJobPrice";
import type { ChangeStorageQuotaSchema } from "src/pages/api/admin/changeStorage";
import type { FetchJobsSchema } from "src/pages/api/admin/fetchJobs/fetchJobs";
import type { GetFetchJobInfoSchema } from "src/pages/api/admin/fetchJobs/getFetchInfo";
import type { SetFetchStateSchema } from "src/pages/api/admin/fetchJobs/setFetchState";
import type { GetTenantUsersSchema } from "src/pages/api/admin/getTenantUsers";
import type { ImportUsersSchema } from "src/pages/api/admin/importUsers";
import type { QueryStorageQuotaSchema } from "src/pages/api/admin/queryStorageQuota";
import type { AuthCallbackSchema } from "src/pages/api/auth/callback";
import type { LogoutSchema } from "src/pages/api/auth/logout";
import type { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import type { GetUserStatusSchema } from "src/pages/api/dashboard/status";
import type { GetChargesSchema } from "src/pages/api/finance/charges";
import type { GetUsedPayTypesSchema } from "src/pages/api/finance/getUsedPayTypes";
import type { FinancePaySchema } from "src/pages/api/finance/pay";
import type { GetPaymentsSchema } from "src/pages/api/finance/payments";
import type { ChangeJobTimeLimitSchema } from "src/pages/api/job/changeJobTimeLimit";
import type { GetJobByBiJobIndexSchema } from "src/pages/api/job/getJobByBiJobIndex";
import type { GetJobInfoSchema } from "src/pages/api/job/jobInfo";
import type { QueryJobTimeLimitSchema } from "src/pages/api/job/queryJobTimeLimit";
import type { GetRunningJobsSchema } from "src/pages/api/job/runningJobs";
import type { ChangePasswordSchema } from "src/pages/api/profile/changePassword";
import type { DewhitelistAccountSchema } from "src/pages/api/tenant/accountWhitelist/dewhitelistAccount";
import type { GetWhitelistedAccountsSchema } from "src/pages/api/tenant/accountWhitelist/getWhitelistedAccounts";
import type { WhitelistAccountSchema } from "src/pages/api/tenant/accountWhitelist/whitelistAccount";
import type { CreateAccountSchema } from "src/pages/api/tenant/createAccount";
import type { GetAccountsSchema } from "src/pages/api/tenant/getAccounts";
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
  changeJobPrice: fromApi<ChangeJobPriceSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/changeJobPrice")),
  changeStorageQuota: fromApi<ChangeStorageQuotaSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/changeStorage")),
  fetchJobs: fromApi<FetchJobsSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/fetchJobs/fetchJobs")),
  getFetchJobInfo: fromApi<GetFetchJobInfoSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/fetchJobs/getFetchInfo")),
  setFetchState: fromApi<SetFetchStateSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/fetchJobs/setFetchState")),
  getTenantUsers: fromApi<GetTenantUsersSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/getTenantUsers")),
  importUsers: fromApi<ImportUsersSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/importUsers")),
  queryStorageQuota: fromApi<QueryStorageQuotaSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/admin/queryStorageQuota")),
  authCallback: fromApi<AuthCallbackSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/callback")),
  logout: fromApi<LogoutSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/logout")),
  validateToken: fromApi<ValidateTokenSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/validateToken")),
  getUserStatus: fromApi<GetUserStatusSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/dashboard/status")),
  getCharges: fromApi<GetChargesSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/finance/charges")),
  getUsedPayTypes: fromApi<GetUsedPayTypesSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/finance/getUsedPayTypes")),
  financePay: fromApi<FinancePaySchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/finance/pay")),
  getPayments: fromApi<GetPaymentsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/finance/payments")),
  getIcon: fromApi<GetIconSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api//icon")),
  changeJobTimeLimit: fromApi<ChangeJobTimeLimitSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/changeJobTimeLimit")),
  getJobByBiJobIndex: fromApi<GetJobByBiJobIndexSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getJobByBiJobIndex")),
  getJobInfo: fromApi<GetJobInfoSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/jobInfo")),
  queryJobTimeLimit: fromApi<QueryJobTimeLimitSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/queryJobTimeLimit")),
  getRunningJobs: fromApi<GetRunningJobsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/runningJobs")),
  changePassword: fromApi<ChangePasswordSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/profile/changePassword")),
  dewhitelistAccount: fromApi<DewhitelistAccountSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant/accountWhitelist/dewhitelistAccount")),
  getWhitelistedAccounts: fromApi<GetWhitelistedAccountsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant/accountWhitelist/getWhitelistedAccounts")),
  whitelistAccount: fromApi<WhitelistAccountSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant/accountWhitelist/whitelistAccount")),
  createAccount: fromApi<CreateAccountSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant/createAccount")),
  getAccounts: fromApi<GetAccountsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/tenant/getAccounts")),
  addUserToAccount: fromApi<AddUserToAccountSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/addToAccount")),
  blockUserInAccount: fromApi<BlockUserInAccountSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/blockInAccount")),
  createUser: fromApi<CreateUserSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/create")),
  getAccountUsers: fromApi<GetAccountUsersSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users")),
  cancelJobChargeLimit: fromApi<CancelJobChargeLimitSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/jobChargeLimit/cancel")),
  setJobChargeLimit: fromApi<SetJobChargeLimitSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/jobChargeLimit/set")),
  removeUserFromAccount: fromApi<RemoveUserFromAccountSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/removeFromAccount")),
  setAdmin: fromApi<SetAdminSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/setAsAdmin")),
  queryStorageUsage: fromApi<QueryStorageUsageSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/storageUsage")),
  unblockUserInAccount: fromApi<UnblockUserInAccountSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/unblockInAccount")),
  unsetAdmin: fromApi<UnsetAdminSchema>("PUT", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/users/unsetAdmin")),
};
