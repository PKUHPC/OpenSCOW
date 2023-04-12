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
import type { GetClusterInfoSchema } from "src/pages/api//cluster";
import type { ConnectToAppSchema } from "src/pages/api/app/connectToApp";
import type { CreateAppSessionSchema } from "src/pages/api/app/createAppSession";
import type { GetAppMetadataSchema } from "src/pages/api/app/getAppMetadata";
import type { GetAppSessionsSchema } from "src/pages/api/app/getAppSessions";
import type { ListAvailableAppsSchema } from "src/pages/api/app/listAvailableApps";
import type { AuthCallbackSchema } from "src/pages/api/auth/callback";
import type { LogoutSchema } from "src/pages/api/auth/logout";
import type { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import type { CreateDesktopSchema } from "src/pages/api/desktop/createDesktop";
import type { KillDesktopSchema } from "src/pages/api/desktop/killDesktop";
import type { LaunchDesktopSchema } from "src/pages/api/desktop/launchDesktop";
import type { ListAvailableWmsSchema } from "src/pages/api/desktop/listAvailableWms";
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
import type { QueryFilesTransferProgressSchema } from "src/pages/api/file/queryFilesTransferProgress";
import type { StartFilesTransferSchema } from "src/pages/api/file/startFilesTransfer";
import type { TerminateFilesTransferSchema } from "src/pages/api/file/terminateFilesTransfer";
import type { UploadFileSchema } from "src/pages/api/file/upload";
import type { CancelJobSchema } from "src/pages/api/job/cancelJob";
import type { GetAccountsSchema } from "src/pages/api/job/getAccounts";
import type { GetAllJobsSchema } from "src/pages/api/job/getAllJobs";
import type { GetJobTemplateSchema } from "src/pages/api/job/getJobTemplate";
import type { GetRunningJobsSchema } from "src/pages/api/job/getRunningJobs";
import type { ListJobTemplatesSchema } from "src/pages/api/job/listJobTemplates";
import type { SubmitJobSchema } from "src/pages/api/job/submitJob";
import type { ChangePasswordSchema } from "src/pages/api/profile/changePassword";
import { publicConfig } from "src/utils/config";



const basePath = publicConfig.BASE_PATH || "";


export const api = {
  connectToApp: fromApi<ConnectToAppSchema>("POST", join(basePath, "/api/app/connectToApp")),
  createAppSession: fromApi<CreateAppSessionSchema>("POST", join(basePath, "/api/app/createAppSession")),
  getAppMetadata: fromApi<GetAppMetadataSchema>("GET", join(basePath, "/api/app/getAppMetadata")),
  getAppSessions: fromApi<GetAppSessionsSchema>("GET", join(basePath, "/api/app/getAppSessions")),
  listAvailableApps: fromApi<ListAvailableAppsSchema>("GET", join(basePath, "/api/app/listAvailableApps")),
  authCallback: fromApi<AuthCallbackSchema>("GET", join(basePath, "/api/auth/callback")),
  logout: fromApi<LogoutSchema>("DELETE", join(basePath, "/api/auth/logout")),
  validateToken: fromApi<ValidateTokenSchema>("GET", join(basePath, "/api/auth/validateToken")),
  getClusterInfo: fromApi<GetClusterInfoSchema>("GET", join(basePath, "/api//cluster")),
  createDesktop: fromApi<CreateDesktopSchema>("POST", join(basePath, "/api/desktop/createDesktop")),
  killDesktop: fromApi<KillDesktopSchema>("POST", join(basePath, "/api/desktop/killDesktop")),
  launchDesktop: fromApi<LaunchDesktopSchema>("POST", join(basePath, "/api/desktop/launchDesktop")),
  listAvailableWms: fromApi<ListAvailableWmsSchema>("GET", join(basePath, "/api/desktop/listAvailableWms")),
  listDesktops: fromApi<ListDesktopsSchema>("GET", join(basePath, "/api/desktop/listDesktops")),
  copyFileItem: fromApi<CopyFileItemSchema>("PATCH", join(basePath, "/api/file/copy")),
  createFile: fromApi<CreateFileSchema>("POST", join(basePath, "/api/file/createFile")),
  deleteDir: fromApi<DeleteDirSchema>("DELETE", join(basePath, "/api/file/deleteDir")),
  deleteFile: fromApi<DeleteFileSchema>("DELETE", join(basePath, "/api/file/deleteFile")),
  downloadFile: fromApi<DownloadFileSchema>("GET", join(basePath, "/api/file/download")),
  fileExist: fromApi<FileExistSchema>("GET", join(basePath, "/api/file/fileExist")),
  getFileType: fromApi<GetFileTypeSchema>("GET", join(basePath, "/api/file/getFileType")),
  getHomeDirectory: fromApi<GetHomeDirectorySchema>("GET", join(basePath, "/api/file/getHome")),
  listFile: fromApi<ListFileSchema>("GET", join(basePath, "/api/file/list")),
  mkdir: fromApi<MkdirSchema>("POST", join(basePath, "/api/file/mkdir")),
  moveFileItem: fromApi<MoveFileItemSchema>("PATCH", join(basePath, "/api/file/move")),
  startFilesTransfer: fromApi<StartFilesTransferSchema>("PATCH", join(basePath, "/api/file/startFilesTransfer")),
  uploadFile: fromApi<UploadFileSchema>("POST", join(basePath, "/api/file/upload")),
  cancelJob: fromApi<CancelJobSchema>("DELETE", join(basePath, "/api/job/cancelJob")),
  getAccounts: fromApi<GetAccountsSchema>("GET", join(basePath, "/api/job/getAccounts")),
  getAllJobs: fromApi<GetAllJobsSchema>("GET", join(basePath, "/api/job/getAllJobs")),
  getJobTemplate: fromApi<GetJobTemplateSchema>("GET", join(basePath, "/api/job/getJobTemplate")),
  getRunningJobs: fromApi<GetRunningJobsSchema>("GET", join(basePath, "/api/job/getRunningJobs")),
  listJobTemplates: fromApi<ListJobTemplatesSchema>("GET", join(basePath, "/api/job/listJobTemplates")),
  submitJob: fromApi<SubmitJobSchema>("POST", join(basePath, "/api/job/submitJob")),
  changePassword: fromApi<ChangePasswordSchema>("PATCH", join(basePath, "/api/profile/changePassword")),
  queryFilesTransferProgress: fromApi<QueryFilesTransferProgressSchema>("GET", join(basePath, "/api/file/queryFilesTransferProgress")),
  terminateFilesTransfer: fromApi<TerminateFilesTransferSchema>("POST", join(basePath, "/api/file/terminateFilesTransfer")),
};
