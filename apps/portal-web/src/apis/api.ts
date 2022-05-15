/* eslint-disable max-len */

import { fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { join } from "path";
import type { GetIconSchema } from "src/pages/api//icon";
import type { GetLogoSchema } from "src/pages/api//logo";
import type { AuthCallbackSchema } from "src/pages/api/auth/callback";
import type { LogoutSchema } from "src/pages/api/auth/logout";
import type { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import type { GetRunningJobsSchema } from "src/pages/api/job/getRunningJobs";
import type { SubmitJobSchema } from "src/pages/api/job/submitJob";
import type { ChangePasswordSchema } from "src/pages/api/profile/changePassword";
import type { LaunchDesktopSchema } from "src/pages/api/vnc/launchDesktop";


export const api = {
  authCallback: fromApi<AuthCallbackSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/callback")),
  logout: fromApi<LogoutSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/logout")),
  validateToken: fromApi<ValidateTokenSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/validateToken")),
  getIcon: fromApi<GetIconSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api//icon")),
  getRunningJobs: fromApi<GetRunningJobsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getRunningJobs")),
  submitJob: fromApi<SubmitJobSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/submitJob")),
  getLogo: fromApi<GetLogoSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api//logo")),
  changePassword: fromApi<ChangePasswordSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/profile/changePassword")),
  launchDesktop: fromApi<LaunchDesktopSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/vnc/launchDesktop")),
};
  