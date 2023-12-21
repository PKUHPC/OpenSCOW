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

import { join } from "path";
import { DownloadQuery } from "src/app/(auth)/files/download/route";
import { UploadQuery } from "src/app/(auth)/files/upload/route";
// import { BASE_PATH } from "src/utils/config";
const BASE_PATH = "/";

export const urlToDownload = (
  clusterId: string, path: string, download: boolean,
): string => {

  const searchParams = new URLSearchParams({
    path: path,
    clusterId,
    download: String(download) as "true" | "false",
  } satisfies DownloadQuery);

  return join(BASE_PATH, "/files/download") + "?" + searchParams.toString();
};
export const urlToUpload = (
  clusterId: string, path: string,
): string => {

  const searchParams = new URLSearchParams({
    path: path,
    clusterId,
  } satisfies UploadQuery);

  return join(BASE_PATH, "/files/upload") + "?" + searchParams.toString();
};

