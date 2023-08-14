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
import { AppServiceClient } from "@scow/protos/build/portal/app";
import { createServer } from "src/app";

let server: Server;
let client: AppServiceClient;

beforeEach(async () => {

  server = await createServer();

  await server.start();

  client = new AppServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await server.close();
});

it("create app with wrong argument", async () => {
  const reply = await asyncUnaryCall(client, "createAppSession", {
    appId: "vscode",
    appJobName: "vscode-20220101-080000",
    cluster: "hpc01",
    userId: "123",
    nodeCount: 1,
    coreCount: 2,
    account: "b",
    maxTime: 60,
    partition: "default",
    qos: "high",
    proxyBasePath: "/api/proxy",
    customAttributes: { version5: "abc" },
  }).catch((e) => e);
  expect(reply.code).toBe(status.INVALID_ARGUMENT);

});
