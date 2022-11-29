/* eslint-disable max-len */
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { createServer } from "src/app";
import { misConfig } from "src/config/mis";
import { AdminServiceClient } from "src/generated/server/admin";
import { createSourceDbOrm } from "src/tasks/fetch";
import { clearAndClose, dropDatabase } from "tests/data/helpers";

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

  const jobTableOrm = await createSourceDbOrm(server.logger);

  try {
    await jobTableOrm.dbConnection.getSchemaGenerator().ensureDatabase();
    await jobTableOrm.dbConnection.getSchemaGenerator().createSchema();

    let info = await asyncClientCall(client, "getFetchInfo", {});
    expect(info.lastFetchTime).toBeUndefined();

    await asyncClientCall(client, "fetchJobs", {});

    info = await asyncClientCall(client, "getFetchInfo", {});
    expect(info.lastFetchTime).not.toBeUndefined();
  } finally {
    await clearAndClose(jobTableOrm.dbConnection);
  }
});
