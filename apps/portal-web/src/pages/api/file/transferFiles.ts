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
import { FileServiceClient } from "@scow/protos/build/portal/file";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface TransferFilesSchema {
  method: "PATCH";

  body: {
    srcCluster: string;
    dstCluster: string;
    fromPath: string;
    toPath: string;
    maxDepth?: number;
    port?: number;
    sshKeyPath?: string;
    remove: boolean;
  }

  responses: {
    204: null;
    415: {
      code: "SCOW-SYNC_CMD_FAILED";
      // stderr of the scow-sync command
      error: string;
    }
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<TransferFilesSchema>("TransferFilesSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { srcCluster, dstCluster, fromPath, toPath, maxDepth, port, sshKeyPath, remove } = req.body;

  const client = getClient(FileServiceClient);

  return asyncUnaryCall(client, "transferFiles", {
    userId: info.identityId,
    srcCluster: srcCluster,
    dstCluster: dstCluster,
    fromPath: fromPath,
    toPath: toPath,
    maxDepth: maxDepth ? maxDepth : 2,
    port: port ? port : 22,
    sshKeyPath: sshKeyPath ? sshKeyPath : "~/.ssh/id_rsa",
    remove: remove,
  }).then(() => ({ 204: null }), handlegRPCError({
    [status.INTERNAL]: (e) => ({ 415: { code: "SCOW-SYNC_CMD_FAILED" as const, error: e.details } }),
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
  }));
});
