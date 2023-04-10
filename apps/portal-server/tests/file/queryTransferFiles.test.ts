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
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { credentials } from "@grpc/grpc-js";
import { sftpExists, sftpMkdir, sftpRmdir, sftpUnlink } from "@scow/lib-ssh";
import { FileServiceClient, TransferInfo } from "@scow/protos/build/portal/file";
import path from "path";
import { createServer } from "src/app";
import { cluster, connectToTestServer,
  createTestItems, resetTestServer, TestSshServer, userId } from "tests/file/utils";

let ssh: TestSshServer;
let server: Server;
let client: FileServiceClient;

// 传输进度
const scowPath = `/home/${userId}/scow`;
const scowSyncPath = path.join(scowPath, ".scow-sync");
const testTransferDir = path.join(scowSyncPath, "test");
const testTransferFile = path.join(testTransferDir, "test1.out");

// 传输进度记录的传输文件
const fatherPath = "/transfer_dir";
const fileName = "transfer_file";

// queryTransferFiles的返回结果
const filePath = path.join(fatherPath, fileName);
const recvCluster = "123.123.123.123";
const transferSize = "44,564,480";
const progress = "42%";
const speed = "1.74MB/s";
const leftTime = "0:00:33";

const content = recvCluster + " " + fatherPath + "\n"
  + fileName + "\n"
  + "\r" + transferSize + " " + progress + " " + speed + " " + leftTime;

beforeEach(async () => {
  ssh = await connectToTestServer();
  await createTestItems(ssh);

  server = await createServer();
  await server.start();

  client = new FileServiceClient(server.serverAddress, credentials.createInsecure());

  // 上传测试文件，用于scow-sync-query读取
  const scowExist = await sftpExists(ssh.sftp, scowPath);
  if (!scowExist) { await sftpMkdir(ssh.sftp)(scowPath); }

  const scowSyncExist = await sftpExists(ssh.sftp, scowSyncPath);
  if (!scowSyncExist) { await sftpMkdir(ssh.sftp)(scowSyncPath); }

  await sftpMkdir(ssh.sftp)(testTransferDir);

  await asyncRequestStreamCall(client, "upload", async ({ writeAsync }) => {
    await writeAsync({ message: { $case: "info", info: { cluster, path: testTransferFile, userId } } });
    await writeAsync({ message: { $case: "chunk", chunk: Buffer.from(content) } });
  });
});

afterEach(async () => {
  // 删去用于测试的目录和文件
  await sftpUnlink(ssh.sftp)(testTransferFile);
  await sftpRmdir(ssh.sftp)(testTransferDir);

  await resetTestServer(ssh);
  await server.close();
});


it.skip("query the transfer information of scow-sync", async () => {
  const result = await asyncUnaryCall(client, "queryFilesTransfer", {
    cluster, userId,
  });

  expect(result.transferInfos.length).toBe(1);
  const transferInfo: TransferInfo = result.transferInfos[0];

  expect(transferInfo.recvCluster).toBe(recvCluster);
  expect(transferInfo.filePath).toBe(filePath);
  expect(transferInfo.transferSize).toBe(transferSize);
  expect(transferInfo.progress).toBe(progress);
  expect(transferInfo.speed).toBe(speed);
  expect(transferInfo.leftTime).toBe(leftTime);

});
