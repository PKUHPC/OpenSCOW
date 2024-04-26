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

import { ReaderExtensions } from "@ddadaal/tsgrpc-common";
import { ObjectWritable } from "@grpc/grpc-js/build/src/object-stream";
import { Logger } from "ts-log";

export interface CopyRequest {
  userId: string;
  fromPath: string;
  toPath: string;
}

export interface CopyReply {}

export interface MoveRequest {
  userId: string;
  fromPath: string;
  toPath: string;
}

export interface MoveReply {}

export interface ExistsRequest {
  userId: string;
  path: string;
}

export interface ExistsReply {
  exists: boolean;
}


export interface CreateFileRequest {
  userId: string;
  path: string;
}

export interface CreateFileReply {}

export interface DeleteDirectoryRequest {
  userId: string;
  path: string;
}

export interface DeleteDirectoryReply {}

export interface DeleteFileRequest {
  userId: string;
  path: string;
}

export interface DeleteFileReply {}

export interface ReadDirectoryRequest {
  userId: string;
  path: string;
  updateAccessTime?: boolean
}

export interface FileInfo {
  name: string;
  type: FileInfo_FileType;
  mtime: string;
  mode: number;
  size: number;
}

export enum FileInfo_FileType {
  FILE = 0,
  DIR = 1,
}

export interface ReadDirectoryReply {
  results: FileInfo[];
}


export interface GetHomeDirectoryRequest {
  userId: string;
}

export interface GetHomeDirectoryReply {
  path: string;
}

export interface MakeDirectoryRequest {
  userId: string;
  path: string;
}

export interface MakeDirectoryReply {}

export interface DownloadRequest {
  userId: string;
  path: string;
  call: ObjectWritable<{ chunk: Uint8Array }>
}

export interface DownloadReply {}

interface UploadRequest_Info {
  userId: string;
  path: string;
}

interface UploadRequest_ReadStream {
  message?: { $case: "info"; info: UploadRequest_Info } | { $case: "chunk"; chunk: Uint8Array } | undefined
}

export interface UploadRequest {
  userId: string;
  path: string;
  call: ReaderExtensions<UploadRequest_ReadStream>
}

export interface UploadReply {
  writtenBytes: number;
}

export interface GetFileMetadataRequest {
  userId: string;
  path: string;
}

export interface GetFileMetadataReply {
  size: number;
  type: string;
}

export interface FileOps {
  copy(req: CopyRequest, logger: Logger): Promise<CopyReply>;
  move(req: MoveRequest, logger: Logger): Promise<MoveReply>;
  exists(req: ExistsRequest, logger: Logger): Promise<ExistsReply>;

  createFile(req: CreateFileRequest, logger: Logger): Promise<CreateFileReply>;
  deleteFile(req: DeleteFileRequest, logger: Logger): Promise<DeleteFileReply>;

  readDirectory(req: ReadDirectoryRequest, logger: Logger): Promise<ReadDirectoryReply>;
  deleteDirectory(req: DeleteDirectoryRequest, logger: Logger): Promise<DeleteDirectoryReply>;
  getHomeDirectory(req: GetHomeDirectoryRequest, logger: Logger): Promise<GetHomeDirectoryReply>;
  makeDirectory(req: MakeDirectoryRequest, logger: Logger): Promise<MakeDirectoryReply>;

  upload(req: UploadRequest, logger: Logger): Promise<UploadReply>;
  download(req: DownloadRequest, logger: Logger): Promise<DownloadReply>;

  getFileMetadata(req: GetFileMetadataRequest, logger: Logger): Promise<GetFileMetadataReply>;

  // StartFileTransfer(req: StartFileTransferRequest, logger: Logger): Promise<StartFileTransferReply>;
  // QueryFileTransfer(req: QueryFileTransferRequest, logger: Logger): Promise<QueryFileTransferReply>;
  // TerminateFileTransfer(req: TerminateFileTransferRequest, logger: Logger): Promise<TerminateFileTransferReply>;
  // CheckTransferKey(req: CheckTransferKeyRequest, logger: Logger): Promise<CheckTransferKeyReply>;
}
