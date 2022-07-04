import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { contentType } from "mime-types";
import { basename } from "path";
import { authenticate } from "src/auth/server";
import { getClusterLoginNode, sshRawConnect } from "src/utils/ssh";

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

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  const ssh = await sshRawConnect(host, info.identityId);

  const sftp = await ssh.requestSFTP();

  const filename = basename(path).replace("\"", "\\\"");
  const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);

  res.writeHead(200, download ? {
    "Content-Type": getContentType(filename, "application/octet-stream"),
    "Content-Disposition": `attachment; ${dispositionParm}`,
  } : {
    "Content-Type": getContentType(filename, "text/plain; charset=utf-8"),
    "Content-Disposition": `inline; ${dispositionParm}`,
  });

  const stream = sftp.createReadStream(path);

  await new Promise<void>((resolve) => {
    const end = () => {
      stream.destroy();
      ssh.dispose();
      res.end();
      resolve();
    };

    stream.on("error", (error) => {
      res.status(500).send(new Error("Error reading file", { cause: error }));
      end();
    });
    stream.on("end", end);

    stream.pipe(res);

  });
});

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
