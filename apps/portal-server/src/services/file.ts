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

import { createWriterExtensions } from "@ddadaal/tsgrpc-common";
import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { loggedExec, sftpAppendFile, sftpExists, sftpMkdir, sftpReaddir,
  sftpReadFile, sftpRealPath, sftpRename, sftpStat, sftpUnlink, sftpWriteFile, sshRmrf } from "@scow/lib-ssh";
import { FileInfo, FileInfo_FileType,
  FileServiceServer, FileServiceService, TransferInfo } from "@scow/protos/build/portal/file";
import { clusters } from "src/config/clusters";
import { config } from "src/config/env";
import { clusterNotFound } from "src/utils/errors";
import { pipeline } from "src/utils/pipeline";
import { getClusterLoginNode, getClusterTransferNode, sshConnect, tryGetClusterTransferNode } from "src/utils/ssh";
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
          throw <ServiceError>{ code: status.INTERNAL, message: "rename failed", details: error };
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
            type: isDir ? FileInfo_FileType.DIR : FileInfo_FileType.FILE,
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

        return [{ size: stat.size, type: stat.isDirectory() ? "dir" : "file" }];
      });
    },

    exists: async ({ request, logger }) => {
      const { userId, cluster, path } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();
        const exists = await sftpExists(sftp, path);
        return [{ exists }];
      });
    },

    startFilesTransfer: async ({ request, logger }) => {
      const { fromCluster, toCluster, userId, fromPath, toPath } = request;

      const fromTransferNodeAddress = getClusterTransferNode(fromCluster).address;

      const {
        host: toTransferNodeHost,
        port: toTransferNodePort,
      } = getClusterTransferNode(toCluster);

      // 执行scow-sync-start
      return await sshConnect(fromTransferNodeAddress, userId, logger, async (ssh) => {

        // 密钥路径
        const sftp = await ssh.requestSFTP();
        const homePath = await sftpRealPath(sftp)(".");
        const privateKeyPath = `${homePath}/scow/.scow-sync-ssh/id_rsa`;

        const cmd = "scow-sync-start";
        const args = [
          "-a", toTransferNodeHost,
          "-u", userId,
          "-s", fromPath,
          "-d", toPath,
          "-m", "2",
          "-p", toTransferNodePort.toString(),
          "-k", privateKeyPath,
        ];
        // console.log("cmd", cmd, args);
        const resp = await loggedExec(ssh, logger, true, cmd, args);

        if (resp.code !== 0) {
          throw <ServiceError> {
            code: status.INTERNAL,
            message: "scow-sync-start command failed",
            details: resp.stderr,
          };
        }
        return [{}];
      });
    },

    queryFilesTransfer: async ({ request, logger }) => {

      const { cluster, userId } = request;

      const transferNodeAddress = getClusterTransferNode(cluster).address;

      return await sshConnect(transferNodeAddress, userId, logger, async (ssh) => {
        const cmd = "scow-sync-query";
        const resp = await loggedExec(ssh, logger, true, cmd, []);

        if (resp.code !== 0) {
          throw <ServiceError> {
            code: status.INTERNAL,
            message: "scow-sync-query command failed",
            details: resp.stderr,
          };
        }

        interface TransferInfosJson {
          recvAddress: string,
          filePath: string,
          transferSize: string,
          progress: string,
          speed: string,
          leftTime: string
        }

        // 解析scow-sync-query返回的json数组
        const transferInfosJsons: TransferInfosJson[] = JSON.parse(resp.stdout);
        const transferInfos: TransferInfo[] = [];
        // 根据host确定clusterId
        transferInfosJsons.forEach((info) => {
          let toCluster = info.recvAddress;
          for (const key in clusters) {
            const transferNode = tryGetClusterTransferNode(key);
            if (transferNode) {
              const clusterHost = transferNode.host;
              if (clusterHost === info.recvAddress) {
                toCluster = key;
              }
            }
            else {
              continue;
            }
          }
          // 将json数组中的string类型解析成protos中定义的格式
          let speedInKB = 0;
          const speedMatch = info.speed.match(/([\d\.]+)([kMGB]?B\/s)/);
          if (speedMatch) {
            const speed = Number(speedMatch[1]);
            switch (speedMatch[2]) {
            case "B/s":
              speedInKB = speed / 1024;
              break;
            case "kB/s":
              speedInKB = speed;
              break;
            case "MB/s":
              speedInKB = speed * 1024;
              break;
            case "GB/s":
              speedInKB = speed * 1024 * 1024;
              break;
            }
          }
          const [hours, minutes, seconds] = info.leftTime.split(":").map(Number);
          const leftTimeSeconds = hours * 3600 + minutes * 60 + seconds;
          transferInfos.push({
            toCluster: toCluster,
            filePath: info.filePath,
            transferSizeKb: Math.floor(Number(info.transferSize.replace(/,/g, "")) / 1024),
            progress: Number(info.progress.split("%")[0]),
            speedKBps: speedInKB,
            remainingTimeSeconds: leftTimeSeconds,
          });
        });

        return [{ transferInfos:transferInfos }];
      });
    },

    terminateFilesTransfer: async ({ request, logger }) => {
      const { fromCluster, toCluster, userId, fromPath } = request;

      const fromTransferNodeAddress = getClusterTransferNode(fromCluster).address;
      const toTransferNodeHost = getClusterTransferNode(toCluster).host;

      return await sshConnect(fromTransferNodeAddress, userId, logger, async (ssh) => {

        const cmd = "scow-sync-terminate";
        const args = [
          "-a", toTransferNodeHost,
          "-u", userId,
          "-s", fromPath,
        ];
        const resp = await loggedExec(ssh, logger, true, cmd, args);

        if (resp.code !== 0) {
          throw <ServiceError> {
            code: status.INTERNAL,
            message: "scow-sync-terminate command failed",
            details: resp.stderr,
          };
        }
        return [{}];
      });
    },

    checkTransferKey: async ({ request, logger }) => {

      const { fromCluster, toCluster, userId } = request;

      const fromTransferNodeAddress = getClusterTransferNode(fromCluster).address;
      const {
        address: toTransferNodeAddress,
        host: toTransferNodeHost,
        port: toTransferNodePort,
      } = getClusterTransferNode(toCluster);

      // 检查fromTransferNode -> toTransferNode是否已经免密
      const { keyConfiged, scowDir, keyDir, privateKeyPath } = await sshConnect(
        fromTransferNodeAddress, userId, logger, async (ssh) => {
          // 获取密钥路径
          const sftp = await ssh.requestSFTP();
          const homePath = await sftpRealPath(sftp)(".");
          const scowDir = `${homePath}/scow`;
          const keyDir = `${scowDir}/.scow-sync-ssh`;
          const privateKeyPath = `${keyDir}/id_rsa`;

          const cmd = "scow-sync-start";
          const args = [
            "-a", toTransferNodeHost,
            "-u", userId,
            "-p", toTransferNodePort.toString(),
            "-k", privateKeyPath,
            "-c", // -c,--check参数检查是否免密，并stdout返回true/false
          ];
          const resp = await loggedExec(ssh, logger, true, cmd, args);

          if (resp.code !== 0) {
            throw <ServiceError> {
              code: status.INTERNAL,
              message: "check the key of transferring cross clusters failed",
              details: resp.stderr,
            };
          }

          const keyConfiged = resp.stdout === "true";

          return {
            keyConfiged: keyConfiged,
            scowDir: scowDir,
            keyDir: keyDir,
            privateKeyPath: privateKeyPath,
          };
        });

      // 如果没有配置免密，则生成密钥并配置免密
      if (!keyConfiged) {
        // 随机生成密钥
        const publicKey = await sshConnect(fromTransferNodeAddress, userId, logger, async (ssh) => {
          const sftp = await ssh.requestSFTP();
          if (!await sftpExists(sftp, scowDir)) {
            await sftpMkdir(sftp)(scowDir);
          }
          if (await sftpExists(sftp, keyDir)) {
            await sshRmrf(ssh, keyDir);
          }
          await sftpMkdir(sftp)(keyDir);
          const genKeyCmd = `ssh-keygen -t rsa -b 4096 -C "for scow-sync" -f ${privateKeyPath} -N ""`;
          await loggedExec(ssh, logger, true, genKeyCmd, []);
          // 读公钥
          const fileData = await sftpReadFile(sftp)(`${privateKeyPath}.pub`);
          return fileData.toString();
        });

        // 配置fromTransferNode -> toTransferNode的免密登录
        await sshConnect(toTransferNodeAddress, userId, logger, async (ssh) => {
          const sftp = await ssh.requestSFTP();
          const homePath = await sftpRealPath(sftp)(".");
          // 将公钥写入到authorized_keys中
          const authorizedKeysPath = `${homePath}/.ssh/authorized_keys`;
          await sftpAppendFile(sftp)(authorizedKeysPath, `\n${publicKey}\n`);
        });
      }
      return [{}];
    },
  });
});
