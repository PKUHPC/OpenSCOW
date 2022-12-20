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
import { sftpExists, sftpMkdir } from "@scow/lib-ssh";
import { FileServiceClient } from "@scow/protos/build/portal/file";
import { join } from "path";
import { createServer } from "src/app";

import { actualPath, cluster, connectToTestServer, createFile, createTestItems,
  expectGrpcThrow,
  resetTestServer, TestSshServer, userId } from "./utils";

const fileName = "testfile";
let ssh: TestSshServer;
let server: Server;
let client: FileServiceClient;

beforeEach(async () => {
  ssh = await connectToTestServer();
  await createTestItems(ssh);

  await createFile(ssh.sftp, actualPath(fileName));

  server = await createServer();
  await server.start();

  client = new FileServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await resetTestServer(ssh);
  await server.close();
});

it("copies file", async () => {

  const newFileName = "newFile";

  await asyncUnaryCall(client, "copy", {
    cluster, userId,
    fromPath: actualPath(fileName),
    toPath: actualPath(newFileName),
  });

  expect(await sftpExists(ssh.sftp, actualPath(fileName))).toBeTrue();
  expect(await sftpExists(ssh.sftp, actualPath(newFileName))).toBeTrue();
});

it("copies directory", async () => {
  const sourceFolder = "newFolder";
  const containingFile = "testfile";
  const targetFolder = "targetFolder";

  await sftpMkdir(ssh.sftp)(actualPath(sourceFolder));

  await createFile(ssh.sftp, actualPath(join(sourceFolder, containingFile)));

  await asyncUnaryCall(client, "copy", {
    cluster, userId,
    fromPath: actualPath(sourceFolder),
    toPath: actualPath(targetFolder),
  });

  expect(await sftpExists(ssh.sftp, actualPath(sourceFolder))).toBeTrue();
  expect(await sftpExists(ssh.sftp, actualPath(targetFolder))).toBeTrue();
  expect(await sftpExists(ssh.sftp, actualPath(join(targetFolder, containingFile)))).toBeTrue();
});

it("returns error if target dir contains a dir with the same name as the original file", async () => {
  const sourceFolder = "newFolder";
  const containingFile = "testfile";
  const targetFolder = "targetFolder";

  await sftpMkdir(ssh.sftp)(actualPath(sourceFolder));
  await createFile(ssh.sftp, actualPath(join(sourceFolder, containingFile)));
  await sftpMkdir(ssh.sftp)(actualPath(targetFolder));
  await sftpMkdir(ssh.sftp)(actualPath(join(targetFolder, containingFile)));

  await expectGrpcThrow(asyncUnaryCall(client, "copy", {
    cluster, userId,
    fromPath: actualPath(actualPath(join(sourceFolder, containingFile))),
    toPath: actualPath(targetFolder),
  }), (e) => {
    expect(e.code).toBe(status.INTERNAL);
  });
});
