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
import { join } from "path";
import { createServer } from "src/app";
import { portalConfig } from "src/config/portal";

import { cluster, connectToTestServer, createTestLastSubmissionForVscode,
  resetTestServer, TestSshServer, userId } from "../file/utils";

let ssh: TestSshServer;
let server: Server;
let client: AppServiceClient;

const originalLastSubmissionDir = "scow/apps";

beforeEach(async () => {

  ssh = await connectToTestServer();
  await createTestLastSubmissionForVscode(ssh);

  server = await createServer();
  await server.start();

  client = new AppServiceClient(server.serverAddress, credentials.createInsecure());

  const basePath = `tests/testFolder${process.env.JEST_WORKER_ID}/${userId}`;
  portalConfig.appLastSubmissionDir = join(basePath, portalConfig.appLastSubmissionDir);

});

afterEach(async () => {
  portalConfig.appLastSubmissionDir = originalLastSubmissionDir;
  await resetTestServer(ssh);
  await server.close();
});


it("gets app last submission with attributes", async () => {

  const appId = "vscode";

  const reply = await asyncUnaryCall(client, "getAppLastSubmission"
    , { userId, cluster, appId });

  expect(reply.lastSubmissionInfo).toEqual(
    {
      userId: "test",
      cluster: "hpc01",
      appId: "vscode",
      appName: "VSCode",
      account: "a_aaaaaa",
      partition: "compute",
      qos: "high",
      nodeCount: 1,
      coreCount: 2,
      maxTime: 10,
      submitTime: "2021-12-22T16:16:02.000Z",
      customAttributes: { selectVersion: "code-server/4.9.0", sbatchOptions: "--time 10" },
    },
  );

});

it("returns undefined if not exists", async () => {
  const appId = "emacs";
  const reply = await asyncUnaryCall(client, "getAppLastSubmission", { userId, cluster, appId });
  expect(reply).toEqual({});
});
