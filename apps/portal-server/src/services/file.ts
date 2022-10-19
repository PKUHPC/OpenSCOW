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
import { finished } from "stream/promises";

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
          throw <ServiceError> { code: status.INTERNAL, message: resp.stderr };
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
          throw <ServiceError>{ code: status.ALREADY_EXISTS, message: `${path} already exists` };
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
          throw <ServiceError>{ code: status.INTERNAL, message: error };
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
          throw <ServiceError> { code: status.PERMISSION_DENIED, message: `${path} is not accessible` };
        });

        if (!stat.isDirectory()) {
          throw <ServiceError> {
            code: status.FAILED_PRECONDITION, message: `${path} is not directory or not exists` };
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
            details: "Error when reading file. Message: " + e?.message,
          };
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
            public details: ServiceError["details"],
          ) {}

          toServiceError(): ServiceError {
            return <ServiceError> { code: this.code, details: this.details };
          }
        }

        try {
          const writeStream = sftp.createWriteStream(path);

          let writtenBytes = 0;

          await pipeline(
            call.iter(),
            async (req) => {
              if (!req.message) {
                throw new RequestError(
                  status.INVALID_ARGUMENT,
                  "Request is received but message is undefined",
                );
              }

              if (req.message.$case === "chunk") {
                logger.info("Chunk of size %d is received", req.message.chunk.length);
                writtenBytes += req.message.chunk.length;
                return req.message.chunk;
              }

              throw new RequestError(
                status.INVALID_ARGUMENT,
                `Expect receive chunk but received message of type ${req.message.$case}`,
              );
            },
            writeStream,
          );

          // ensure the data is written
          writeStream.end();
          await finished(writeStream);

          return [{ writtenBytes }];
        } catch (e: any) {
          if (e instanceof RequestError) {
            throw e.toServiceError();
          } else {
            throw <ServiceError> {
              code: status.INTERNAL,
              details: "Error when writing file. Message: " + e?.message,
            };
          }

        }

      });


    },

  });
});
