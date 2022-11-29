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

export interface CopyFileItemSchema {
  method: "PATCH";

  body: {
    cluster: string;
    fromPath: string;
    toPath: string;
  }

  responses: {
    204: null;
    415: {
      code: "CP_CMD_FAILED";
      // stderr of the cp command
      error: string;
    }
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<CopyFileItemSchema>("CopyFileItemSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, fromPath, toPath } = req.body;

  const client = getClient(FileServiceClient);

  return asyncUnaryCall(client, "copy", {
    cluster, fromPath, toPath, userId: info.identityId,
  }).then(() => ({ 204: null }), handlegRPCError({
    [status.INTERNAL]: (e) => ({ 415: { code: "CP_CMD_FAILED" as const, error: e.details } }),
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
  }));
});
