/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { ConfigServiceClient } from "@scow/protos/build/common/config";
import { readFileSync } from "fs";
import { join } from "path";
import { createServer } from "src/app";

let server: Server;
let client: ConfigServiceClient;

beforeEach(async () => {

  server = await createServer();

  await server.start();

  client = new ConfigServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await server.close();
});

it("get scow version configs info", async () => {

  const reply = await asyncUnaryCall(client, "getApiVersion", { query: {} });

  const version = await JSON.parse(readFileSync(join(__dirname,
    "../../node_modules/@scow/protos/package.json"), "utf-8")).version;
  const [major, minor, patch] = version.split(".").map(Number);
  console.log(version);
  expect(reply.major).toBe(major);
  expect(reply.minor).toBe(minor);
  expect(reply.patch).toBe(patch);
});
