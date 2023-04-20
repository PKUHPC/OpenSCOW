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
import { TransferInfo } from "src/utils/file";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface QueryFilesTransferProgressSchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: { result: TransferInfo[] };
    400: { code: "INVALID_CLUSTER" }
    415: { code: "SCOW-SYNC-QUERY_CMD_FAILED" }
  }
}

const auth = authenticate(() => true);

export default route<QueryFilesTransferProgressSchema>("QueryFilesTransferProgressSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(FileServiceClient);
  return asyncUnaryCall(client, "queryFilesTransfer", {
    cluster, userId: info.identityId,
  }).then((results) => ({ 200: { result: results.transferInfos } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
    [status.INTERNAL]: () => ({ 415: { code: "SCOW-SYNC-QUERY_CMD_FAILED" as const } }),
  }));
});
