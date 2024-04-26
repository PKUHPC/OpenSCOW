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

import { ServiceError, status } from "@grpc/grpc-js";
import { ScowdClient } from "@scow/lib-scowd/build/client";
import { FileInfo, fileInfo_FileTypeFromJSON } from "@scow/protos/build/portal/file";
import { FileType } from "@scow/scowd-protos/build/storage/file_pb";
import { FileOps } from "src/clusterops/api/file";
import { config } from "src/config/env";

export const scowdFileServices = (client: ScowdClient): FileOps => ({
  copy: async (request) => {
    const { userId, fromPath, toPath } = request;

    await client.file.copy({ fromPath, toPath }, { headers: { IdentityId: userId } });
    return {};
    
  },

  createFile: async (request) => {

    const { userId, path } = request;

    await client.file.createFile({ filePath: path }, { headers: { IdentityId: userId } });
    return {};
    
  },

  deleteDirectory: async (request) => {
    const { userId, path } = request;

    await client.file.deleteDirectory({ dirPath: path }, { headers: { IdentityId: userId } });
    return {};
  },

  deleteFile: async (request) => {

    const { userId, path } = request;

    await client.file.deleteFile({ filePath: path }, { headers: { IdentityId: userId } });
    return {};
  },

  getHomeDirectory: async (request) => {
    const { userId } = request;

    const res = await client.file.getHomeDirectory({}, { headers: { IdentityId: userId } });
    return { path: res.path };
  },

  makeDirectory: async (request) => {
    const { userId, path } = request;

    await client.file.makeDirectory({ dirPath: path }, { headers: { IdentityId: userId } });
    return {};
  },

  move: async (request) => {
    const { userId, fromPath, toPath } = request;

    await client.file.move({ fromPath, toPath }, { headers: { IdentityId: userId } });
    return {};
    
  },

  readDirectory: async (request) => {
    const { userId, path } = request;

    
    const res = await client.file.readDirectory({ userId, dirPath: path });

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
  },

  download: async (request) => {
    const { userId, path, call } = request;

    const readStream = await client.file.download({
      userId, path, chunkSize: config.DOWNLOAD_CHUNK_SIZE,
    });

    for await (const response of readStream) {
      call.write(response);
    }

    return {};
  },

  upload: async (request, logger) => {
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
  },

  getFileMetadata: async (request) => {
    const { userId, path } = request;

    const res = await client.file.getFileMetadata({ userId, filePath: path });

    return { size: Number(res.size), type: res.type === FileType.DIR ? "dir" : "file" };
  },

  exists: async (request) => {
    const { userId, path } = request;

    const res = await client.file.exists({ userId, path: path });

    return { exists: res.exists };
  },
});