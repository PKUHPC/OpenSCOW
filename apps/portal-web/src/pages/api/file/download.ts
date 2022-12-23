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

import { asyncReplyStreamCall, asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { FileServiceClient } from "@scow/protos/build/portal/file";
import { contentType } from "mime-types";
import { basename } from "path";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { pipeline } from "src/utils/pipeline";
import { route } from "src/utils/route";

export interface DownloadFileSchema {
  method: "GET";

  query: {
    cluster: string;
    path: string;
    /**
     * 文件应该被下载
     * 如果为false，则设置Content-Disposition为inline，且body返回文件内容。
     * 否则为attachment; filename=\"\"",
     */
    download?: boolean;
  }

  responses: {
    200: any;

    400: { code: "INVALID_CLUSTER" }

    404: { code: "NOT_EXISTS" }
  }
}

// if the contentType is one of these, they can be previewed
// return as text/plain
const textFiles = ["application/x-sh"];

function getContentType(filename: string, defaultValue: string) {
  const type = contentType(basename(filename));

  if (!type) {
    return defaultValue;
  }

  if (textFiles.some((x) => type.startsWith(x))) {
    return "text/plain; charset=utf-8";
  }

  return type;
}

const auth = authenticate(() => true);

export default route<DownloadFileSchema>("DownloadFileSchema", async (req, res) => {
  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, path, download } = req.query;

  const client = getClient(FileServiceClient);

  const filename = basename(path).replace("\"", "\\\"");
  const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);

  const reply = await asyncUnaryCall(client, "getFileMetadata", {
    userId: info.identityId, cluster, path,
  });

  res.writeHead(200, download ? {
    "Content-Type": getContentType(filename, "application/octet-stream"),
    "Content-Disposition": `attachment; ${dispositionParm}`,
    "Content-Length": reply.size,
  } : {
    "Content-Type": getContentType(filename, "text/plain; charset=utf-8"),
    "Content-Disposition": `inline; ${dispositionParm}`,
    "Content-Length": reply.size,
  });

  const stream = asyncReplyStreamCall(client, "download", {
    cluster, path, userId: info.identityId,
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

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
