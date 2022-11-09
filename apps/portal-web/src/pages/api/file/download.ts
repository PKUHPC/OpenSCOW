import { asyncReplyStreamCall, asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { contentType } from "mime-types";
import { basename } from "path";
import { authenticate } from "src/auth/server";
import { FileServiceClient } from "src/generated/portal/file";
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
