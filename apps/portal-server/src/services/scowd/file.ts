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

import { ConnectError } from "@connectrpc/connect";
import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { FileInfo, fileInfo_FileTypeFromJSON,
  FileServiceServer, FileServiceService } from "@scow/protos/build/portal/file";
import { FileType } from "@scow/scowd-protos/build/storage/file_pb";
import { config } from "src/config/env";
import { scowdClientNotFound } from "src/utils/errors";
import { convertCodeToGrpcStatus, getScowdClient } from "src/utils/scowd";
import { getClusterTransferNode } from "src/utils/ssh";

export const scowdFileServiceServer = plugin((server) => {

  server.addService<FileServiceServer>(FileServiceService, {
    copy: async ({ request }) => {
      const { userId, cluster, fromPath, toPath } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      try {
        await client.file.copy({ fromPath, toPath }, { headers: { IdentityId: userId } });
        return [{}];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while copying file ${fromPath} to ${toPath}`,
        };
      }
    },

    createFile: async ({ request, logger }) => {

      const { userId, cluster, path } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      const subLogger = logger.child({ userId, cluster });
      subLogger.info("CreateFile started");

      try {
        await client.file.createFile({ filePath: path }, { headers: { IdentityId: userId } });
        return [{}];
      } catch (err) {
        subLogger.error(err);
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while creating file ${path}`,
        };
      }
    },

    deleteDirectory: async ({ request, logger }) => {
      const { userId, cluster, path } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      const subLogger = logger.child({ userId, cluster });
      subLogger.info("deleteDirectory started");

      try {
        await client.file.deleteDirectory({ dirPath: path }, { headers: { IdentityId: userId } });
        return [{}];
      } catch (err) {
        subLogger.error(err);
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while deleting directory ${path}`,
        };
      }
    },

    deleteFile: async ({ request }) => {

      const { userId, cluster, path } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      try {
        await client.file.deleteFile({ filePath: path }, { headers: { IdentityId: userId } });
        return [{}];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while deleting file ${path}`,
        };
      }
    },

    getHomeDirectory: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      const subLogger = logger.child({ userId, cluster });
      subLogger.info("GetHomeDirectory file started");
      try {
        const res = await client.file.getHomeDirectory({}, { headers: { IdentityId: userId } });
        return [{ path: res.path }];
      } catch (err) {
        if (err instanceof ConnectError) {
          subLogger.error(err.message);
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while get ${userId}'s home directory`,
        };
      }
    },

    makeDirectory: async ({ request }) => {
      const { userId, cluster, path } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      try {
        await client.file.makeDirectory({ dirPath: path }, { headers: { IdentityId: userId } });
        return [{}];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while making directory ${path}`,
        };
      }
    },

    move: async ({ request }) => {
      const { userId, cluster, fromPath, toPath } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      try {
        await client.file.move({ fromPath, toPath }, { headers: { IdentityId: userId } });
        return [{}];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while moving ${fromPath} to ${toPath}`,
        };
      }
    },

    readDirectory: async ({ request }) => {
      const { userId, cluster, path } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      try {
        const res = await client.file.readDirectory({ dirPath: path }, { headers: { IdentityId: userId } });

        const results: FileInfo[] = res.filesInfo.map((info): FileInfo => {
          return {
            name: info.name,
            type: fileInfo_FileTypeFromJSON(info.fileType),
            mtime: info.modTime,
            mode: info.mode,
            size: Number(info.size),
          };
        });
        return [{ results }];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while reading directory ${path}`,
        };
      }
    },

    download: async (call) => {
      const { logger, request: { cluster, path, userId } } = call;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      const subLogger = logger.child({ userId, path, cluster });
      subLogger.info("Download file started");
    
      try {
        const readStream = await client.file.download({ 
          path, chunkSize: config.DOWNLOAD_CHUNK_SIZE,
        }, { headers: { IdentityId: userId } });
      
        for await (const response of readStream) {
          call.write(response);
        }
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw {
          code: status.INTERNAL,
          details: `Error when reading file ${path}`,
        };
      } finally {
        call.end();
        subLogger.info("Download file completed");
      }
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

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

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

      const logger = call.logger.child({ upload: { userId, path, cluster } });
      logger.info("Upload file started");

      try {
        const res = await client.file.upload((async function* () {
          yield { message: { case: "info", value: { path, userId } } };

          for await (const data of call.iter()) {
            if (data.message?.$case !== "chunk") {
              throw new RequestError(
                status.INVALID_ARGUMENT,
                `Expect receive chunk but received message of type ${data.message?.$case}`,
              );
            }
            yield { message: { case: "chunk", value: data.message.chunk } };
          }
        })());
        return [{ writtenBytes: Number(res.writtenBytes) }];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw {
          code: status.INTERNAL,
          details: `Error when writing file ${path}`,
        };
      }
    },

    getFileMetadata: async ({ request }) => {
      const { userId, cluster, path } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      try {
        const res = await client.file.getFileMetadata({ filePath: path }, { headers: { IdentityId: userId } });

        return [{ size: Number(res.size), type: res.type === FileType.DIR ? "dir" : "file" }];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while getting file ${path} metadata`,
        };
      }
    },

    exists: async ({ request }) => {
      const { userId, cluster, path } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      try {
        const res = await client.file.exists({ path: path }, { headers: { IdentityId: userId } });

        return [{ exists: res.exists }];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while check file ${path} exists`,
        };
      }
    },

    startFileTransfer: async ({ request }) => {

      const { fromCluster, toCluster, userId, fromPath, toPath } = request;
      const {
        host: toTransferNodeHost,
        port: toTransferNodePort,
      } = getClusterTransferNode(toCluster);

      const client = getScowdClient(fromCluster);

      if (!client) { throw scowdClientNotFound(fromCluster); }

      try {
        await client.file.startFileTransfer({ 
          fromPath, toPath, toTransferNodeHost, toTransferNodePort: toTransferNodePort.toString(),
        }, { headers: { IdentityId: userId } });

        return [{}];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError> {
          code: status.UNKNOWN,
          message: "scow-sync-start command failed",
        };
      }
    },

    queryFileTransfer: async ({ request }) => {

      const { cluster, userId } = request;

      const client = getScowdClient(cluster);

      if (!client) { throw scowdClientNotFound(cluster); }

      try {
        const res = await client.file.queryFileTransfer({}, { headers: { IdentityId: userId } });

        const transferInfos = res.transferInfos.map((transferInfo) => {
          return {
            ...transferInfo,
            transferSizeKb: Number(transferInfo.transferSizeKb),
            remainingTimeSeconds: Number(transferInfo.remainingTimeSeconds),
          };
        });

        return [{ transferInfos }];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError> {
          code: status.UNKNOWN,
          message: "scow-sync-start command failed",
        };
      }
    },

    terminateFileTransfer: async ({ request }) => {
      const { fromCluster, toCluster, userId, fromPath } = request;

      const client = getScowdClient(fromCluster);

      if (!client) { throw scowdClientNotFound(fromCluster); }

      const toTransferNodeHost = getClusterTransferNode(toCluster).host;

      try {
        await client.file.terminateFileTransfer({ 
          toTransferNodeHost, fromPath,
        }, { headers: { IdentityId: userId } });

        return [{}];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError> {
          code: status.UNKNOWN,
          message: "scow-sync-start command failed",
        };
      }
    },

    checkTransferKey: async ({ request }) => {

      const { fromCluster, toCluster, userId } = request;

      const {
        host: toTransferNodeHost,
        port: toTransferNodePort,
      } = getClusterTransferNode(toCluster);

      const client = getScowdClient(fromCluster);

      if (!client) { throw scowdClientNotFound(fromCluster); }

      try {
        await client.file.checkTransferKey({ 
          toTransferNodeHost, toTransferNodePort: toTransferNodePort.toString(),
        }, { headers: { IdentityId: userId } });

        return [{}];
      } catch (err) {
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError> {
          code: status.UNKNOWN,
          message: "scow-sync-start command failed",
        };
      }
      return [{}];
    },
  });
});
