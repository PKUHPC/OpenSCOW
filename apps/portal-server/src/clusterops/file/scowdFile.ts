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
import { ServiceError, status } from "@grpc/grpc-js";
import { ScowdClient } from "@scow/lib-scowd/build/client";
import { FileInfo, fileInfo_FileTypeFromJSON } from "@scow/protos/build/portal/file";
import { FileType } from "@scow/scowd-protos/build/storage/file_pb";
import { FileOps } from "src/clusterops/api/file";
import { config } from "src/config/env";
import { convertCodeToGrpcStatus } from "src/utils/scowd";

export const scowdFileServices = (client: ScowdClient): FileOps => ({
  Copy: async (request, logger) => {
    const { userId, fromPath, toPath } = request;

    try {
      await client.file.copy({ fromPath, toPath }, { headers: { IdentityId: userId } });
      return {};
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while copying file ${fromPath} to ${toPath}`,
      };
    }
  },

  CreateFile: async (request, logger) => {

    const { userId, path } = request;

    try {
      await client.file.createFile({ filePath: path }, { headers: { IdentityId: userId } });
      return {};
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while creating file ${path}`,
      };
    }
  },

  DeleteDirectory: async (request, logger) => {
    const { userId, path } = request;

    try {
      await client.file.deleteDirectory({ dirPath: path }, { headers: { IdentityId: userId } });
      return {};
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while deleting directory ${path}`,
      };
    }
  },

  DeleteFile: async (request, logger) => {

    const { userId, path } = request;

    try {
      await client.file.deleteFile({ filePath: path }, { headers: { IdentityId: userId } });
      return {};
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while deleting file ${path}`,
      };
    }
  },

  GetHomeDirectory: async (request, logger) => {
    const { userId } = request;

    try {
      const res = await client.file.getHomeDirectory({}, { headers: { IdentityId: userId } });
      return { path: res.path };
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while get ${userId}'s home directory`,
      };
    }
  },

  MakeDirectory: async (request, logger) => {
    const { userId, path } = request;

    try {
      await client.file.makeDirectory({ dirPath: path }, { headers: { IdentityId: userId } });
      return {};
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while making directory ${path}`,
      };
    }
  },

  Move: async (request, logger) => {
    const { userId, fromPath, toPath } = request;

    try {
      await client.file.move({ fromPath, toPath }, { headers: { IdentityId: userId } });
      return {};
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while moving ${fromPath} to ${toPath}`,
      };
    }
  },

  ReadDirectory: async (request, logger) => {
    const { userId, path } = request;

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
      return { results };
    } catch (err) {
      logger.error(err);

      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while reading directory ${path}`,
      };
    }
  },

  Download: async (request, logger) => {
    const { userId, path, call } = request;

    try {
      const readStream = await client.file.download({
        path, chunkSize: config.DOWNLOAD_CHUNK_SIZE,
      }, { headers: { IdentityId: userId } });

      for await (const response of readStream) {
        call.write(response);
      }

      return {};
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
      logger.info("Download file completed");
    }
  },

  Upload: async (request, logger) => {
    const { call, userId, path } = request;

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
      return { writtenBytes: Number(res.writtenBytes) };
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

  GetFileMetadata: async (request, logger) => {
    const { userId, path } = request;

    try {
      const res = await client.file.getFileMetadata({ filePath: path }, { headers: { IdentityId: userId } });

      return { size: Number(res.size), type: res.type === FileType.DIR ? "dir" : "file" };
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while getting file ${path} metadata`,
      };
    }
  },

  Exists: async (request, logger) => {
    const { userId, path } = request;

    try {
      const res = await client.file.exists({ path: path }, { headers: { IdentityId: userId } });

      return { exists: res.exists };
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while check file ${path} exists`,
      };
    }
  },
});