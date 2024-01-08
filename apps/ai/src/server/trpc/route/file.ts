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

import {
  loggedExec, sftpExists, sftpMkdir, sftpReaddir,
  sftpRealPath, sftpRename, sftpStat, sftpWriteFile,
} from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { contentType } from "mime-types";
import { basename, join } from "path";
import { FileInfo } from "src/models/File";
import { config } from "src/server/config/env";
import { router } from "src/server/trpc/def";
import { authProcedure } from "src/server/trpc/procedure/base";
import { copyFile } from "src/server/utils/copyFile";
import { deleteDir, deleteFile } from "src/server/utils/deleteItem";
import { clusterNotFound } from "src/server/utils/errors";
import { logger } from "src/server/utils/logger";
import { getClusterLoginNode, sshConnect } from "src/server/utils/ssh";
import { z } from "zod";

export const FileType = z.union([z.literal("FILE"), z.literal("DIR")]);
export type FileType = z.infer<typeof FileType>;

export const ListDirectorySchema = z.object({
  type: FileType,
  name: z.string(),
  mtime: z.string(),
  size: z.number(),
  mode: z.number(),
});

export const file = router({
  getHomeDir: authProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/file/homeDir",
        tags: ["file"],
        summary: "获取用户家目录路径",
      },
    })
    .input(z.object({ clusterId: z.string() }))
    .output(z.object({ path: z.string() }))
    .query(async ({ input: { clusterId }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const path = await sftpRealPath(sftp)(".");

        return { path };
      });
    }),


  deleteItem: authProcedure
    .input(z.object({ clusterId: z.string(), target: z.enum(["FILE", "DIR"]), path: z.string() }))
    .mutation(async ({ input: { target, clusterId, path }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      if (target === "FILE") {
        return await deleteFile({ host, userIdentityId: user.identityId, filePath: path });
      } else {
        return await deleteDir({ host, userIdentityId: user.identityId, dirPath: path });
      }
    }),

  copyOrMove: authProcedure
    .input(z.object({ clusterId: z.string(), op: z.enum(["copy", "move"]), fromPath: z.string(), toPath: z.string() }))
    .mutation(async ({ input: { op, clusterId, fromPath, toPath }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      if (op === "copy") {

        return await copyFile({ host, userIdentityId: user.identityId, fromPath, toPath });

      } else {

        return await sshConnect(host, user.identityId, logger, async (ssh) => {
          const sftp = await ssh.requestSFTP();

          const error = await sftpRename(sftp)(fromPath, toPath).catch((e) => e);
          if (error) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "move failed", cause: error });
          }

          return {};
        });
      }
    }),

  mkdir: authProcedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .mutation(async ({ input: { clusterId, path }, ctx: { user } }) => {
      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user.identityId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        if (await sftpExists(sftp, path)) {
          throw new TRPCError({ code: "CONFLICT", message: `${path} already exists` });
        }

        await sftpMkdir(sftp)(path);

        return {};
      });
    }),

  createFile: authProcedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .mutation(async ({ input: { clusterId, path }, ctx: { user } }) => {
      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user.identityId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        if (await sftpExists(sftp, path)) {
          throw new TRPCError({ code: "CONFLICT", message: `${path} already exists` });
        }

        await sftpWriteFile(sftp)(path, Buffer.alloc(0));

        return {};
      });

    }),

  listDirectory: authProcedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .output(z.array(ListDirectorySchema))
    .query(async ({ input: { clusterId, path }, ctx: { user } }) => {
      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(path).catch((e) => {
          logger.error(e, "stat %s as %s failed", path, user.identityId);
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: `${path} is not accessible` });
        });

        if (!stat || !stat.isDirectory()) {
          throw new TRPCError({ code: "UNPROCESSABLE_CONTENT", message: `${path} is not directory or not exists` });
        }

        const files = await sftpReaddir(sftp)(path);
        const list: FileInfo[] = [];

        // 通过touch -a命令实现共享文件系统的缓存刷新
        const pureFiles = files.filter((file) => !file.longname.startsWith("d"));

        if (pureFiles.length > 0) {
          const filePaths = pureFiles.map((file) => join(path, file.filename)).join(" ");

          const fileSyncCmd = `touch -a ${filePaths}`;

          await loggedExec(ssh, logger, false, fileSyncCmd, []);
        }

        for (const file of files) {

          const isDir = file.longname.startsWith("d");

          list.push({
            type: isDir ? "DIR" : "FILE",
            name: file.filename,
            mtime: new Date(file.attrs.mtime * 1000).toISOString(),
            size: file.attrs.size,
            mode: file.attrs.mode,
          });
        }
        return list.map((x) => ({
          ...x,
          type: x.type === "DIR" ? "DIR" as const : "FILE" as const,
        }));
      });
    }),

  checkFileExist: authProcedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .query(async ({ input: { clusterId, path }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();
        const exists = await sftpExists(sftp, path);
        return { exists };
      });
    }),

  getFileType: authProcedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .query(async ({ input: { clusterId, path }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(path).catch((e) => {
          logger.error(e, "stat %s as %s failed", path, user.identityId);
          throw new TRPCError({ code: "FORBIDDEN", message: `${path} is not accessible` });
        });

        return { size: stat.size, type: stat.isDirectory() ? "dir" : "file" };
      });
    }),

  getFileMetadata: authProcedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .query(async ({ input: { clusterId, path }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(path).catch((e) => {
          logger.error(e, "stat %s as %s failed", path, user.identityId);
          throw new TRPCError({ code: "FORBIDDEN", message: `${path} is not accessible` });
        });

        return { size: stat.size, type: stat.isDirectory() ? "dir" : "file" };
      });
    }),

  download: authProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/file/download",
        tags: ["file"],
        summary: "获取用户家目录路径",
      },
    })
    .input(z.object({ clusterId: z.string(), path: z.string(), download: z.string() }))
    .output(z.void())
    .query(async ({ input: { clusterId, path, download }, ctx: { user, res } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      const subLogger = logger.child({ user, path, clusterId });
      subLogger.info("Download file started");

      await sshConnect(host, user.identityId, subLogger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(path).catch((e) => {
          logger.error(e, "stat %s as %s failed", path, user.identityId);
          throw new TRPCError({ code: "FORBIDDEN", message: `${path} is not accessible` });
        });

        const readStream = sftp.createReadStream(path, { highWaterMark: config.DOWNLOAD_CHUNK_SIZE });

        const filename = basename(path).replace("\"", "\\\"");
        const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);

        const contentType = download === "true" ? getContentType(filename, "application/octet-stream") :
          getContentType(filename, "text/plain; charset=utf-8");
        res.setHeader("Content-Type", contentType);

        res.setHeader("Content-Disposition", `${download === "true" ? "attachment" : "inline"}; ${dispositionParm}`);

        res.setHeader("Content-Length", String(stat.size));

        return new Promise<void>((resolve, reject) => {
          readStream.pipe(res, { end: true })
            .on("error", () => {
              reject(new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error when reading file" }));
            })
            .on("end", () => {
              resolve();
            });
        });

      });

    }),

  decompression: authProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/file/unzip",
        tags: ["file"],
        summary: "解压文件",
      },
    })
    .input(z.object({ clusterId: z.string(), filePath: z.string(), decompressionPath: z.string() }))
    .output(z.void())
    .mutation(async ({ input: { clusterId, filePath, decompressionPath }, ctx: { user } }) => {
      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      const getDecompressionCommand = () => {
        if (filePath.endsWith(".tar")) {
          return `tar -xf ${filePath} -C ${decompressionPath}`;
        } else if (filePath.endsWith(".tar.gz") || filePath.endsWith(".tgz")) {
          return `tar -xzf ${filePath} -C ${decompressionPath}`;
        } else if (filePath.endsWith(".zip")) {
          // TODO: 解压文件中文乱码，暂时指定为 gbk 编码
          return `unzip -O gbk ${filePath} -d ${decompressionPath}`;
        } else {
          throw new TRPCError({ code: "BAD_REQUEST", message: `${filePath} is an unknown file type` });
        }
      };

      return await sshConnect(host, user!.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(filePath).catch((e) => {
          logger.error(e, "stat %s as %s failed", filePath, user.identityId);
          throw new TRPCError({ code: "FORBIDDEN", message: `${filePath} is not accessible` });
        });

        if (stat.isDirectory()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `${filePath} is a directory` });
        }

        const decompressionCommand = getDecompressionCommand();

        const result = await ssh.execCommand(decompressionCommand);
        if (result.code !== 0) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR",
            message: `Failed to execute decompression command: ${result.stderr}` });
        }
      });
    }),

});

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
