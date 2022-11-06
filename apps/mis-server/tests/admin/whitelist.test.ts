import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal } from "@scow/lib-decimal";
import { createServer } from "src/app";
import { charge } from "src/bl/charging";
import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { AccountServiceClient } from "src/generated/server/account";
import { reloadEntity, toRef } from "src/utils/orm";
import { InitialData, insertInitialData } from "tests/data/data";
import { dropDatabase } from "tests/data/helpers";

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
  await dropDatabase(server.ext.orm);
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

  await reloadEntity(em, a);

  expect(a.blocked).toBeFalse();
});

it("blocks account when it is dewhitelisted and balance is < 0", async () => {

  const whitelist = new AccountWhitelist({
    account: a,
    comment: "",
    operatorId: "123",
  });

  await em.persistAndFlush(whitelist);

  a.balance = new Decimal(-1);

  a.blocked = false;
  a.whitelist = toRef(whitelist);

  await em.flush();

  const resp = await asyncClientCall(client, "dewhitelistAccount", {
    tenantName: a.tenant.getProperty("name"),
    accountName: a.accountName,
  });

  expect(resp.executed).toBeTrue();

  await em.refresh(a);
  await reloadEntity(em, a);

  expect(a.blocked).toBeTrue();
});

it("charges user but don't block account if account is whitelist", async () => {
  a.balance = new Decimal(1);

  a.blocked = false;
  a.whitelist = toRef(new AccountWhitelist({
    account : a,
    comment: "123",
    operatorId: "123",
  }));

  await em.flush();

  const { currentBalance, previousBalance } = await charge({
    amount: new Decimal(2),
    comment: "",
    target: a,
    type: "haha",
  }, em.fork(), server.logger, server.ext);

  await reloadEntity(em, a);

  expect(currentBalance.toNumber()).toBe(-1);
  expect(previousBalance.toNumber()).toBe(1);

  expect(a.blocked).toBeFalse();




});

