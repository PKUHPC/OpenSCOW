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
import { FileServiceClient } from "src/generated/portal/file";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface GetFileTypeSchema {
    method: "GET";

    query: {
      cluster: string;
      path: string;
    };

    responses: {
      200: { type: string };
      400: { code: "INVALID_CLUSTER" | "INVALID_PATH" };
    };
}

const auth = authenticate(() => true);

export default route<GetFileTypeSchema>("GetFileTypeSchema", async (req, res) => {
  
  const info = await auth(req, res);
  
  if (!info) { return; }
  
  const { cluster, path } = req.query;
  
  const client = getClient(FileServiceClient);
  
  return asyncUnaryCall(client, "getFileMetadata", {
    userId: info.identityId, cluster, path,
  }).then((results) => ({ 200: { type: results.type } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
    [status.PERMISSION_DENIED]: () => ({ 400: { code: "INVALID_PATH" as const } }),
  }));
  
});