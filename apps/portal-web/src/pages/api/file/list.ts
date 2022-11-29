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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { FileInfo_FileType, FileServiceClient } from "src/generated/portal/file";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export type FileType = "file" | "dir";

export type FileInfo = {
  name: string;
  type: FileType;
  mtime: string;
  mode: number;
  size: number;
}

export interface ListFileSchema {
  method: "GET";

  query: {
    cluster: string;
    path: string;
  }

  responses: {
    200: { items: FileInfo[] };
    400: { code: "INVALID_CLUSTER" };
    403: { code: "NOT_ACCESSIBLE" };
    412: { code: "DIRECTORY_NOT_FOUND" };
  }
}

const auth = authenticate(() => true);

const mapType = {
  [FileInfo_FileType.Dir]: "dir",
  [FileInfo_FileType.File]: "file",
} as const;

export default route<ListFileSchema>("ListFileSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, path } = req.query;

  const client = getClient(FileServiceClient);

  return asyncUnaryCall(client, "readDirectory", {
    cluster, userId: info.identityId, path,
  }).then(({ results }) => ({ 200: {
    items: results.map(({ mode, mtime, name, size, type }) => ({
      mode, mtime, name, size, type: mapType[type],
    })) } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
    [status.PERMISSION_DENIED]: () => ({ 403: { code: "NOT_ACCESSIBLE" as const } }),
    [status.INVALID_ARGUMENT]: () => ({ 412: { code: "DIRECTORY_NOT_FOUND" as const } }),
  }));

});
