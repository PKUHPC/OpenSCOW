import { Server } from "@ddadaal/tsgrpc-server";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { ChannelCredentials } from "@grpc/grpc-js";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal } from "@scow/lib-decimal";
import { createServer } from "src/app";
import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { AccountServiceClient } from "src/generated/server/account";
import { ormConfigs } from "src/plugins/orm";
import { reloadEntity , toRef } from "src/utils/orm";
import { InitialData, insertInitialData } from "tests/data/data";

let server: Server;
let em: SqlEntityManager;
let client: AccountServiceClient;
let data: InitialData;
let a: Account;

beforeEach(async () => {
  server = await createServer();
  await server.start();

  client = new AccountServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  em = server.ext.orm.em.fork();

  data = await insertInitialData(em);

  a = data.accountA;
});

afterEach(async () => {
  await server.ext.orm.getSchemaGenerator().dropDatabase(ormConfigs.dbName!);
  await server.close();
});

it("unblocks account when added to whitelist", async () => {
  a.blocked = true;

  await em.flush();

  await asyncClientCall(client, "whitelistAccount", {
    tenantName: a.tenant.getProperty("name"),
    accountName: a.accountName,
    comment: "test",
    operatorId: "123",
  });

  await reloadEntity(a);

  expect(a.blocked).toBeFalse();
});

it("blocks account when it is dewhitelisted and balance is < 0", async () => {
  a.balance = new Decimal(-1);

  a.blocked = false;
  a.whitelist = toRef(new AccountWhitelist({
    account: a,
    comment: "",
    operatorId: "123",
  }));

  await em.flush();

  await asyncClientCall(client, "dewhitelistAccount", {
    tenantName: a.tenant.getProperty("name"),
    accountName: a.accountName,
  });

  await reloadEntity(a);

  expect(a.blocked).toBeTrue();
});

