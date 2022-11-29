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
import { sftpMkdir, sftpStat } from "@scow/lib-ssh";
import { createServer } from "src/app";
import { FileServiceClient } from "src/generated/portal/file";
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



it("creates dir", async () => {

  const folderName = "newfolder";
  const path = actualPath(folderName);

  await asyncUnaryCall(client, "makeDirectory", {
    cluster, userId, path,
  });

  expect((await sftpStat(ssh.sftp)(path)).isDirectory()).toBeTrue();
});

it("returns 409 if exists", async () => {
  const folderName = "newfile";
  const folderPath = actualPath(folderName);

  await sftpMkdir(ssh.sftp)(folderPath);

  await expectGrpcThrow(asyncUnaryCall(client, "makeDirectory", {
    cluster, userId, path: folderPath,
  }), (e) => {
    expect(e.code).toBe(status.ALREADY_EXISTS);
  });
});

