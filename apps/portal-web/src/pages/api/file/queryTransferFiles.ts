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

import { asyncReplyStreamCall } from "@ddadaal/tsgrpc-client";
import { FileServiceClient } from "@scow/protos/build/portal/file";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { pipeline } from "src/utils/pipeline";
import { route } from "src/utils/route";
export interface QueryTransferFilesSchema {
  method: "GET";

  query: {
    cluster: string;
    transferId: number;
    processId: number;
  }

  responses: {
    200: any;
    400: { code: "INVALID_CLUSTER" }
    404: { code: "TRANSFER_NOT_EXISTS" }
  }
}

const auth = authenticate(() => true);

export default route<QueryTransferFilesSchema>("QueryTransferFilesSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, transferId, processId } = req.query;

  const client = getClient(FileServiceClient);

  const stream = asyncReplyStreamCall(client, "queryTransferFiles", {
    cluster, transferId, processId, userId: info.identityId,
  });

  await pipeline(
    stream.iter(),
    async (x) => {
      return x.chunk;
    },
    res,
  ).finally(() => {
    res.end();
  });

});
