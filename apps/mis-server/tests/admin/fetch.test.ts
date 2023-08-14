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

/* eslint-disable max-len */
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { AdminServiceClient } from "@scow/protos/build/server/admin";
import { createServer } from "src/app";
import { misConfig } from "src/config/mis";
import { dropDatabase } from "tests/data/helpers";

let server: Server;
let orm: MikroORM<MySqlDriver>;
let client: AdminServiceClient;

beforeEach(async () => {
  server = await createServer();
  await server.start();

  client = new AdminServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  orm = server.ext.orm;
});

afterEach(async () => {
  await dropDatabase(orm);
  await server.close();
});


it("gets current fetch info", async () => {
  const info = await asyncClientCall(client, "getFetchInfo", {});

  expect(info).toEqual({
    fetchStarted: misConfig.fetchJobs.periodicFetch.enabled,
    schedule: misConfig.fetchJobs.periodicFetch.cron,
    lastFetchTime: undefined,
  } as typeof info);

});

it("starts and stops fetch", async () => {
  await asyncClientCall(client, "setFetchState", { started: false });

  let info = await asyncClientCall(client, "getFetchInfo", {});

  expect(info.fetchStarted).toBeFalse();

  await asyncClientCall(client, "setFetchState", { started: true });

  info = await asyncClientCall(client, "getFetchInfo", {});

  expect(info.fetchStarted).toBeTrue();
});

it("triggers fetch and updates last updated", async () => {
  let info = await asyncClientCall(client, "getFetchInfo", {});
  expect(info.lastFetchTime).toBeUndefined();

  await asyncClientCall(client, "fetchJobs", {});

  info = await asyncClientCall(client, "getFetchInfo", {});
  expect(info.lastFetchTime).not.toBeUndefined();
});
