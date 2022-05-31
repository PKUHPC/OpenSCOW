/* eslint-disable max-len */

import { fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { join } from "path";
import type { GetIconSchema } from "src/pages/api//icon";
import type { GetLogoSchema } from "src/pages/api//logo";
import type { CreateAppSessionSchema } from "src/pages/api/app/createAppSession";
import type { GetAppSessionsSchema } from "src/pages/api/app/getAppSessions";
import type { AuthCallbackSchema } from "src/pages/api/auth/callback";
import type { LogoutSchema } from "src/pages/api/auth/logout";
import type { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import type { CreateDesktopSchema } from "src/pages/api/desktop/createDesktop";
import type { KillDesktopSchema } from "src/pages/api/desktop/killDesktop";
import type { LaunchDesktopSchema } from "src/pages/api/desktop/launchDesktop";
import type { ListDesktopsSchema } from "src/pages/api/desktop/listDesktops";
import type { CancelJobSchema } from "src/pages/api/job/cancelJob";
import type { GetAccountsSchema } from "src/pages/api/job/getAccounts";
import type { GetRunningJobsSchema } from "src/pages/api/job/getRunningJobs";
import type { GetSavedJobSchema } from "src/pages/api/job/getSavedJob";
import type { GetSavedJobsSchema } from "src/pages/api/job/getSavedJobs";
import type { SubmitJobSchema } from "src/pages/api/job/submitJob";
import type { ChangePasswordSchema } from "src/pages/api/profile/changePassword";


export const api = {
  createAppSession: fromApi<CreateAppSessionSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/app/createAppSession")),
  getAppSessions: fromApi<GetAppSessionsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/app/getAppSessions")),
  authCallback: fromApi<AuthCallbackSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/callback")),
  logout: fromApi<LogoutSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/logout")),
  validateToken: fromApi<ValidateTokenSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/validateToken")),
  createDesktop: fromApi<CreateDesktopSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/desktop/createDesktop")),
  killDesktop: fromApi<KillDesktopSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/desktop/killDesktop")),
  launchDesktop: fromApi<LaunchDesktopSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/desktop/launchDesktop")),
  listDesktops: fromApi<ListDesktopsSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/desktop/listDesktops")),
  getIcon: fromApi<GetIconSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api//icon")),
  cancelJob: fromApi<CancelJobSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/cancelJob")),
  getAccounts: fromApi<GetAccountsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getAccounts")),
  getRunningJobs: fromApi<GetRunningJobsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getRunningJobs")),
  getSavedJob: fromApi<GetSavedJobSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getSavedJob")),
  getSavedJobs: fromApi<GetSavedJobsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getSavedJobs")),
  submitJob: fromApi<SubmitJobSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/submitJob")),
  getLogo: fromApi<GetLogoSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api//logo")),
  changePassword: fromApi<ChangePasswordSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/profile/changePassword")),
};
