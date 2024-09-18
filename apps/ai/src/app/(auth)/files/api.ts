/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { join } from "path";
import { UploadQuery } from "src/app/(auth)/files/upload/route";

export const urlToDownload = (
  clusterId: string, path: string, download: boolean, basePath: string,
): string => {

  const searchParams = new URLSearchParams({
    path: path,
    clusterId,
    download: String(download) as "true" | "false",
  });

  return join(basePath, "/api/file/download") + "?" + searchParams.toString();
};
export const urlToUpload = (
  clusterId: string, path: string, basePath: string,
): string => {

  const searchParams = new URLSearchParams({
    path: path,
    clusterId,
  } satisfies UploadQuery);

  return join(basePath, "/files/upload") + "?" + searchParams.toString();
};

