import { createWriterExtensions } from "@ddadaal/tsgrpc-common";
import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { sftpExists,
  sftpMkdir, sftpReaddir, sftpRealPath, sftpRename, sftpStat, sftpUnlink, sftpWriteFile, sshRmrf } from "@scow/lib-ssh";
import { config } from "src/config/env";
import { FileInfo, FileInfo_FileType,
  FileServiceServer, FileServiceService } from "src/generated/portal/file";
import { clusterNotFound } from "src/utils/errors";
import { pipeline } from "src/utils/pipeline";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";
import { once } from "stream";

export const fileServiceServer = plugin((server) => {

  server.addService<FileServiceServer>(FileServiceService, {
    copy: async ({ request, logger }) => {
      const { userId, cluster, fromPath, toPath } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {
        // the SFTPWrapper doesn't supprt copy
        // Use command to do it
        const resp = await ssh.exec("cp", ["-r", fromPath, toPath], { stream: "both" });

        if (resp.code !== 0) {
          throw <ServiceError> { code: status.INTERNAL, message: "cp command failed", details: resp.stderr };
        }

        return [{}];
      });
    },

    createFile: async ({ request, logger }) => {

      const { userId, cluster, path } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        if (await sftpExists(sftp, path)) {
          throw <ServiceError>{ code: status.ALREADY_EXISTS, message: `${path} already exists` };
        }

        await sftpWriteFile(sftp)(path, Buffer.alloc(0));

        return [{}];
      });
    },

    deleteDirectory: async ({ request, logger }) => {
      const { userId, cluster, path } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {

        await sshRmrf(ssh, path);

        return [{}];
      });
    },

    deleteFile: async ({ request, logger }) => {

      const { userId, cluster, path } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        await sftpUnlink(sftp)(path);

        return [{}];
      });
    },

    getHomeDirectory: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const path = await sftpRealPath(sftp)(".");

        return [{ path }];
      });
    },

    makeDirectory: async ({ request, logger }) => {
      const { userId, cluster, path } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        if (await sftpExists(sftp, path)) {
          throw <ServiceError>{ code: status.ALREADY_EXISTS, details: `${path} already exists` };
        }

        await sftpMkdir(sftp)(path);

        return [{}];
      });

    },

    move: async ({ request, logger }) => {
      const { userId, cluster, fromPath, toPath } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();
        const error = await sftpRename(sftp)(fromPath, toPath).catch((e) => e);
        if (error) {
          // 无需throw，因为已经对重名文件做了检查
          // throw <ServiceError>{ code: status.INTERNAL, message: "rename failed", details: error };
        }

        return [{}];
      });
    },

    readDirectory: async ({ request, logger }) => {
      const { userId, cluster, path } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(path).catch((e) => {
          logger.error(e, "stat %s as %s failed", path, userId);
          throw <ServiceError> {
            code: status.PERMISSION_DENIED, message: `${path} is not accessible`,
          };
        });

        if (!stat.isDirectory()) {
          throw <ServiceError> {
            code: status.INVALID_ARGUMENT,
            message: `${path} is not directory or not exists` };
        }

        const files = await sftpReaddir(sftp)(path);

        const list: FileInfo[] = [];

        for (const file of files) {

          const isDir = file.longname.startsWith("d");

          list.push({
            type: isDir ? FileInfo_FileType.Dir : FileInfo_FileType.File,
            name: file.filename,
            mtime: new Date(file.attrs.mtime * 1000).toISOString(),
            size: file.attrs.size,
            mode: file.attrs.mode,
          });
        }
        return [{ results: list }];
      });
    },

    download: async (call) => {
      const { logger, request: { cluster, path, userId } } = call;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      const subLogger = logger.child({ userId, path, cluster });
      subLogger.info("Download file started");

      await sshConnect(host, userId, subLogger, async (ssh) => {
        const sftp = await ssh.requestSFTP();
        const readStream = sftp.createReadStream(path, { highWaterMark: config.DOWNLOAD_CHUNK_SIZE });

        // cannot use pipeline because it forwards error
        // we don't want to forwards error
        // because the error has code property, conflicting with gRPC'S ServiceError
        await pipeline(
          readStream,
          async (chunk) => {
            return { chunk: Buffer.from(chunk) };
          },
          call,
        ).catch((e) => {
          throw <ServiceError> {
            code: status.INTERNAL,
            message: "Error when reading file",
            details: e?.message,
          };
        }).finally(async () => {
          readStream.close(() => {});
          await once(readStream, "close");
          // await promisify(readStream.close.bind(readStream))();
        });

      });

    },

    upload: async (call) => {
      const info = await call.readAsync();

      if (info?.message?.$case !== "info") {
        throw <ServiceError> {
          code: status.INVALID_ARGUMENT,
          message: "The first message is not file info",
        };
      }

      const { cluster, path, userId } = info.message?.info;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      const logger = call.logger.child({ upload: { userId, path, cluster, host } });

      logger.info("Upload file started");

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        class RequestError {
          constructor(
            public code: ServiceError["code"],
            public message: ServiceError["message"],
            public details?: ServiceError["details"],
          ) {}

          toServiceError(): ServiceError {
            return <ServiceError> { code: this.code, message: this.message, details: this.details };
          }
        }

        try {
          const writeStream = sftp.createWriteStream(path);

          const { writeAsync } = createWriterExtensions(writeStream);

          let writtenBytes = 0;

          for await (const req of call.iter()) {
            if (!req.message) {
              throw new RequestError(
                status.INVALID_ARGUMENT,
                "Request is received but message is undefined",
              );
            }

            if (req.message.$case !== "chunk") {
              throw new RequestError(
                status.INVALID_ARGUMENT,
                `Expect receive chunk but received message of type ${req.message.$case}`,
              );
            }
            await writeAsync(req.message.chunk);
            writtenBytes += req.message.chunk.length;
          }

          // ensure the data is written
          // if (!writeStream.destroyed) {
          //   await new Promise<void>((res, rej) => writeStream.end((e) => e ? rej(e) : res()));
          // }
          writeStream.end();
          await once(writeStream, "close");

          logger.info("Upload complete. Received %d bytes", writtenBytes);

          return [{ writtenBytes }];
        } catch (e: any) {
          if (e instanceof RequestError) {
            throw e.toServiceError();
          } else {
            throw new RequestError(
              status.INTERNAL,
              "Error when writing file",
              e.message,
            ).toServiceError();
          }

        }

      });


    },

    getFileMetadata: async ({ request, logger }) => {
      const { userId, cluster, path } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const stat = await sftpStat(sftp)(path).catch((e) => {
          logger.error(e, "stat %s as %s failed", path, userId);
          throw <ServiceError> {
            code: status.PERMISSION_DENIED, message: `${path} is not accessible`,
          };
        });

        return [{ size: stat.size }];
      });
    },

    exists: async ({ request, logger }) => {
      const { userId, cluster, path } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();
        if (await sftpExists(sftp, path)) {
          return [{ exists: true }];
        }
        else {
          return [{ exists: false }];
        }
      });
    },

  });
});
