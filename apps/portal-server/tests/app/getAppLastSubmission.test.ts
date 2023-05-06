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
import { AppServiceClient } from "@scow/protos/build/portal/app";
import path from "path";
import { createServer } from "src/app";

import { cluster, connectToTestServer, createTestLastSubmissionForVscode,
  createVscodeLastSubmitFile, resetTestServer, TestSshServer, userId } from "../file/utils";

let ssh: TestSshServer;
let server: Server;
let client: AppServiceClient;

beforeEach(async () => {

  ssh = await connectToTestServer();
  await createTestLastSubmissionForVscode(ssh);

  server = await createServer();
  await server.start();

  client = new AppServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await resetTestServer(ssh);
  await server.close();
});

it("gets app last submission with attributes", async () => {

  const appId = "vscode";

  const reply = await asyncUnaryCall(client, "getAppLastSubmission", { userId, cluster, appId });

  console.log("【*******getAppLastSubmissionReply*********】");
  console.log(reply);

  expect(reply).toEqual(
    {
      userId: "test123",
      cluster: "hpc01",
      appId: "vscode",
      appName: "VSCode",
      account: "a_aaaaaa",
      partition: "compute",
      qos: "high",
      coreCount: 2,
      maxTime: 10,
      submitTime: "2021-12-22T16:16:02",
      customAttributes: { selectVersion: "code-server/4.9.0", sbatchOptions: "--time 10" },
    },
  );

});


it("returns undefined if not exists", async () => {
  const appId = "emacs";
  const reply = await asyncUnaryCall(client, "getAppLastSubmission", { userId, cluster, appId });
  expect(reply).toEqual({});
});
