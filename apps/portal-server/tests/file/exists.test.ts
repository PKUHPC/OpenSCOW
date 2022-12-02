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
import { credentials } from "@grpc/grpc-js";
import { createServer } from "src/app";
import { ExistsRequest, FileServiceClient } from "src/generated/portal/file";

import { actualPath, cluster, connectToTestServer, 
  createFile, createTestItems, resetTestServer, TestSshServer, userId } from "./utils";

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

it("return true if exists", async () => {
  const fileName = "file1";
  const filePath = actualPath(fileName);

  await createFile(ssh.sftp, filePath);
  
  const result = await asyncUnaryCall(client, "exists", {
    cluster, userId, path: filePath,
  } as ExistsRequest);

  expect(result.exists).toBeTrue();

});

it("return false if not exists", async () => {
  const fileName = "file2";
  const filePath = actualPath(fileName);

  const result = await asyncUnaryCall(client, "exists", {
    cluster, userId, path: filePath,
  } as ExistsRequest);

  expect(result.exists).toBeFalse();

});