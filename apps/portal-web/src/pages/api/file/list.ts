import { sftpReaddir, sftpStat } from "@scow/lib-ssh";
import { authenticate } from "src/auth/server";
import { route } from "src/utils/route";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";

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

export default route<ListFileSchema>("ListFileSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, path } = req.query;

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  return await sshConnect(host, info.identityId, req.log, async (ssh) => {
    const sftp = await ssh.requestSFTP();

    try {
      const stat = await sftpStat(sftp)(path);

      if (!stat.isDirectory()) {
        return { 412: { code: "DIRECTORY_NOT_FOUND" } } as const;
      }

      const files = await sftpReaddir(sftp)(path);

      const list: FileInfo[] = [];

      for (const file of files) {

        const isDir = file.longname.startsWith("d");

        list.push({
          type: isDir ? "dir" : "file",
          name: file.filename,
          mtime: new Date(file.attrs.mtime * 1000).toISOString(),
          size: file.attrs.size,
          mode: file.attrs.mode,
        });
      }
      return { 200: { items: list } };
    } catch {
      return { 403: { code: "NOT_ACCESSIBLE" } } as const;

    }
  });
});
