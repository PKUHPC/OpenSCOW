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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { credentials, status } from "@grpc/grpc-js";
import { FileInfo, FileInfo_FileType, FileServiceClient } from "@scow/protos/build/portal/file";
import { createServer } from "src/app";
import { actualPath, cluster, connectToTestServer,
  createTestItems, expectGrpcThrow, resetTestServer, TestSshServer, userId } from "tests/file/utils";

let ssh: TestSshServer;
let server: Server;
let client: FileServiceClient;

beforeEach(async () => {
  ssh = await connectToTestServer();
  await createTestItems(ssh);

  server = await createServer();
  await server.start();

  client = new FileServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await resetTestServer(ssh);
  await server.close();
});

it("gets file list", async () => {

  const reply = await asyncUnaryCall(client, "readDirectory", {
    cluster, userId, path: actualPath(""),
  });

  expect(reply.results).toIncludeSameMembers([
    { name: "dir1", type: FileInfo_FileType.DIR,
      mode: expect.any(Number), mtime: expect.any(String), size: expect.any(Number) },
    { name: "test1", type: FileInfo_FileType.FILE,
      mode: expect.any(Number), mtime: expect.any(String), size: expect.any(Number) },
  ] as FileInfo[]);

});

it("returns error if list a file", async () => {

  await expectGrpcThrow(asyncUnaryCall(client, "readDirectory", {
    cluster, userId, path: actualPath("test1"),
  }), (e) => {
    expect(e.code).toBe(status.INVALID_ARGUMENT);
  });
});

it("returns 403 if list non-existent folder", async () => {

  await expectGrpcThrow(asyncUnaryCall(client, "readDirectory", {
    cluster, userId, path: actualPath("folder"),
  }), (e) => {
    expect(e.code).toBe(status.PERMISSION_DENIED);
  });
});


