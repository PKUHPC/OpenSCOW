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

import { asyncRequestStreamCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { credentials, status } from "@grpc/grpc-js";
import { sftpReadFile, sftpStat } from "@scow/lib-ssh";
import { FileServiceClient } from "@scow/protos/build/portal/file";
import { randomBytes } from "crypto";
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

it("uploads file", async () => {

  const fileName = "newfile";

  const filePath = actualPath(fileName);

  const size = 10000;
  const content = randomBytes(size);

  const rep = await asyncRequestStreamCall(client, "upload", async ({ writeAsync }) => {
    await writeAsync({ message: { $case: "info", info: { cluster, path: filePath, userId } } });
    await writeAsync({ message: { $case: "chunk", chunk: content } });
  });

  expect(rep.writtenBytes).toBe(size);

  const stat = await sftpStat(ssh.sftp)(filePath);
  expect(stat.size).toBe(size);
  expect(stat.uid).toBe(1000);

  const fileContent = await sftpReadFile(ssh.sftp)(filePath);
  expect(fileContent).toEqual(content);


});

it("returns error if written to path without permission", async () => {

  const filePath = "/test";

  const size = 10000;
  const content = randomBytes(size);

  await expectGrpcThrow(asyncRequestStreamCall(client, "upload", async function *() {
    yield { message: { $case: "info" as const, info: { cluster, path: filePath, userId } } };
    yield { message: { $case: "chunk" as const, chunk: content } };
  }()), (e) => {
    expect(e.code).toBe(status.INTERNAL);
  });

});

