/* eslint-disable max-len */
import { Server } from "@ddadaal/tsgrpc-server";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { ChannelCredentials } from "@grpc/grpc-js";
import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { createServer } from "src/app";
import { config } from "src/config/env";
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
    fetchStarted: config.FETCH_JOBS_PERIODIC_FETCH_ENABLED,
    schedule: config.FETCH_JOBS_PERIODIC_FETCH_CRON,
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
