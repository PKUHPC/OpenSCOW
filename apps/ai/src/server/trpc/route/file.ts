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

import { loggedExec, sftpAppendFile, sftpExists, sftpMkdir, sftpReaddir,
  sftpReadFile, sftpRealPath, sftpRename, sftpStat, sftpUnlink, sftpWriteFile, sshRmrf } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { join } from "path";
import { FileInfo } from "src/models/File";
import { router } from "src/server/trpc/def";
import { procedure } from "src/server/trpc/procedure/base";
import { clusterNotFound } from "src/server/utils/errors";
import { logger } from "src/server/utils/logger";
import { getClusterLoginNode, sshConnect } from "src/server/utils/ssh";
import { z } from "zod";


export enum FileInfo_FileType {
  FILE = 0,
  DIR = 1,
}

export const file = router({
  getHomeDir: procedure
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

      return await sshConnect(host, user!.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const path = await sftpRealPath(sftp)(".");

        return { path };
      });
    }),


  deleteItem: procedure
    .input(z.object({ clusterId: z.string(), target: z.enum(["FILE", "DIR"]), path: z.string() }))
    .mutation(async ({ input: { target, clusterId, path }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      if (target === "FILE") {
        return await sshConnect(host, user!.identityId, logger, async (ssh) => {

          const sftp = await ssh.requestSFTP();

          await sftpUnlink(sftp)(path);

          return {};
        });
      } else {
        return await sshConnect(host, user!.identityId, logger, async (ssh) => {

          await sshRmrf(ssh, path);

          return {};
        });
      }
    }),

  copyOrMove: procedure
    .input(z.object({ clusterId: z.string(), op: z.enum(["copy", "move"]), fromPath: z.string(), toPath: z.string() }))
    .mutation(async ({ input: { op, clusterId, fromPath, toPath }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      if (op === "copy") {
        return await sshConnect(host, user!.identityId, logger, async (ssh) => {
        // the SFTPWrapper doesn't supprt copy
        // Use command to do it
          const resp = await ssh.exec("cp", ["-r", fromPath, toPath], { stream: "both" });

          if (resp.code !== 0) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "cp command failed", cause:resp.stderr });
          }

          return {};
        });
      } else {

        return await sshConnect(host, user!.identityId, logger, async (ssh) => {
          const sftp = await ssh.requestSFTP();

          const error = await sftpRename(sftp)(fromPath, toPath).catch((e) => e);
          if (error) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "move failed", cause:error });
          }

          return {};
        });
      }
    }),

  mkdir: procedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .mutation(async ({ input: { clusterId, path }, ctx: { user } }) => {
      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user!.identityId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        if (await sftpExists(sftp, path)) {
          throw new TRPCError({ code: "CONFLICT", message: `${path} already exists` });
        }

        await sftpMkdir(sftp)(path);

        return {};
      });
    }),

  createFile: procedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .mutation(async ({ input: { clusterId, path }, ctx: { user } }) => {
      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user!.identityId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        if (await sftpExists(sftp, path)) {
          throw new TRPCError({ code: "CONFLICT", message: `${path} already exists` });
        }

        await sftpWriteFile(sftp)(path, Buffer.alloc(0));

        return {};
      });

    }),

  listDirectory: procedure
    .input(z.object({ clusterId: z.string(), path: z.string() }))
    .query(async ({ input: { clusterId, path }, ctx: { user } }) => {
      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user!.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(path).catch((e) => {
          logger.error(e, "stat %s as %s failed", path, user!.identityId);
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

  checkFileExist: procedure
    .input(z.object({ clusterId:z.string(), path: z.string() }))
    .query(async ({ input: { clusterId, path }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user!.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();
        const exists = await sftpExists(sftp, path);
        return [{ exists }];
      });
    }),

  getFileType: procedure
    .input(z.object({ clusterId:z.string(), path: z.string() }))
    .query(async ({ input: { clusterId, path }, ctx: { user } }) => {

      const host = getClusterLoginNode(clusterId);

      if (!host) { throw clusterNotFound(clusterId); }

      return await sshConnect(host, user!.identityId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(path).catch((e) => {
          logger.error(e, "stat %s as %s failed", path, user!.identityId);
          throw new TRPCError({ code: "FORBIDDEN", message: `${path} is not accessible` });
        });

        return [{ size: stat.size, type: stat.isDirectory() ? "dir" : "file" }];
      });
    }),

});

