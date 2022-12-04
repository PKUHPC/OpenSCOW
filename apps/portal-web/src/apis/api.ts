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

import { fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { join } from "path";
import type { GetIconSchema } from "src/pages/api//icon";
import type { GetLogoSchema } from "src/pages/api//logo";
import type { ConnectToAppSchema } from "src/pages/api/app/connectToApp";
import type { CreateAppSessionSchema } from "src/pages/api/app/createAppSession";
import type { GetAppAttributesSchema } from "src/pages/api/app/getAppAttributes";
import type { GetAppSessionsSchema } from "src/pages/api/app/getAppSessions";
import type { ListAvailableAppsSchema } from "src/pages/api/app/listAvailableApps";
import type { AuthCallbackSchema } from "src/pages/api/auth/callback";
import type { LogoutSchema } from "src/pages/api/auth/logout";
import type { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import type { CreateDesktopSchema } from "src/pages/api/desktop/createDesktop";
import type { KillDesktopSchema } from "src/pages/api/desktop/killDesktop";
import type { LaunchDesktopSchema } from "src/pages/api/desktop/launchDesktop";
import type { ListDesktopsSchema } from "src/pages/api/desktop/listDesktops";
import type { CopyFileItemSchema } from "src/pages/api/file/copy";
import type { CreateFileSchema } from "src/pages/api/file/createFile";
import type { DeleteDirSchema } from "src/pages/api/file/deleteDir";
import type { DeleteFileSchema } from "src/pages/api/file/deleteFile";
import type { DownloadFileSchema } from "src/pages/api/file/download";
import type { FileExistSchema } from "src/pages/api/file/fileExist";
import type { GetFileTypeSchema } from "src/pages/api/file/getFileType";
import type { GetHomeDirectorySchema } from "src/pages/api/file/getHome";
import type { ListFileSchema } from "src/pages/api/file/list";
import type { MkdirSchema } from "src/pages/api/file/mkdir";
import type { MoveFileItemSchema } from "src/pages/api/file/move";
import type { UploadFileSchema } from "src/pages/api/file/upload";
import type { CancelJobSchema } from "src/pages/api/job/cancelJob";
import type { GetAccountsSchema } from "src/pages/api/job/getAccounts";
import type { GetAllJobsSchema } from "src/pages/api/job/getAllJobs";
import type { GetRunningJobsSchema } from "src/pages/api/job/getRunningJobs";
import type { GetSavedJobSchema } from "src/pages/api/job/getSavedJob";
import type { GetSavedJobsSchema } from "src/pages/api/job/getSavedJobs";
import type { SubmitJobSchema } from "src/pages/api/job/submitJob";
import type { ChangePasswordSchema } from "src/pages/api/profile/changePassword";

export const api = {
  connectToApp: fromApi<ConnectToAppSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/app/connectToApp")),
  createAppSession: fromApi<CreateAppSessionSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/app/createAppSession")),
  getAppAttributes: fromApi<GetAppAttributesSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/app/getAppAttributes")),
  getAppSessions: fromApi<GetAppSessionsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/app/getAppSessions")),
  listAvailableApps: fromApi<ListAvailableAppsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/app/listAvailableApps")),
  authCallback: fromApi<AuthCallbackSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/callback")),
  logout: fromApi<LogoutSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/logout")),
  validateToken: fromApi<ValidateTokenSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/auth/validateToken")),
  createDesktop: fromApi<CreateDesktopSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/desktop/createDesktop")),
  killDesktop: fromApi<KillDesktopSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/desktop/killDesktop")),
  launchDesktop: fromApi<LaunchDesktopSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/desktop/launchDesktop")),
  listDesktops: fromApi<ListDesktopsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/desktop/listDesktops")),
  copyFileItem: fromApi<CopyFileItemSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/copy")),
  createFile: fromApi<CreateFileSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/createFile")),
  deleteDir: fromApi<DeleteDirSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/deleteDir")),
  deleteFile: fromApi<DeleteFileSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/deleteFile")),
  downloadFile: fromApi<DownloadFileSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/download")),
  getHomeDirectory: fromApi<GetHomeDirectorySchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/getHome")),
  listFile: fromApi<ListFileSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/list")),
  mkdir: fromApi<MkdirSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/mkdir")),
  moveFileItem: fromApi<MoveFileItemSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/move")),
  uploadFile: fromApi<UploadFileSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/upload")),
  getIcon: fromApi<GetIconSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api//icon")),
  cancelJob: fromApi<CancelJobSchema>("DELETE", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/cancelJob")),
  getAccounts: fromApi<GetAccountsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getAccounts")),
  getAllJobs: fromApi<GetAllJobsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getAllJobs")),
  getRunningJobs: fromApi<GetRunningJobsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getRunningJobs")),
  getSavedJob: fromApi<GetSavedJobSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getSavedJob")),
  getSavedJobs: fromApi<GetSavedJobsSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/getSavedJobs")),
  submitJob: fromApi<SubmitJobSchema>("POST", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/job/submitJob")),
  getLogo: fromApi<GetLogoSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api//logo")),
  changePassword: fromApi<ChangePasswordSchema>("PATCH", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/profile/changePassword")),
  fileExist: fromApi<FileExistSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/fileExist")),
  getFileType: fromApi<GetFileTypeSchema>("GET", join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/file/getFileType")),
};
