import { Server } from "@ddadaal/tsgrpc-server";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { ChannelCredentials } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal,moneyToNumber, numberToMoney  } from "@scow/lib-decimal";
import { createServer } from "src/app";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { PayRecord } from "src/entities/PayRecord";
import { Tenant } from "src/entities/Tenant";
import { ChargeRequest, ChargingServiceClient, PaymentRecord, PayRequest } from "src/generated/server/charging";
import { ormConfigs } from "src/plugins/orm";
import { range } from "src/utils/array";
import { reloadEntity } from "src/utils/orm";


let server: Server;
let em: SqlEntityManager;
let account: Account;

beforeEach(async () => {

  server = await createServer();

  em = server.ext.orm.em.fork();

  const tenant = new Tenant({ name: "test" });

  account = new Account({ accountName: "123", tenant, blocked: false, comment: "test" });

  await em.persistAndFlush([tenant, account]);

  await server.start();

});

afterEach(async () => {
  await server.ext.orm.getSchemaGenerator().dropDatabase(ormConfigs.dbName!);
  await server.close();
});

it("pays account", async () => {

  const amount = numberToMoney(10);

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const reply = await asyncClientCall(client, "pay", {
    tenantName: account.tenant.getProperty("name"),
    accountName: account.accountName,
    amount: amount,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    type: "test",
  });

  expect(moneyToNumber(reply.previousBalance!)).toBe(0);
  expect(moneyToNumber(reply.currentBalance!)).toBe(10);

  await reloadEntity(account);

  expect(account.balance.toNumber()).toBe(10);
});

it("concurrently pays", async () => {
  const amount = numberToMoney(10);

  const createRequests = (): PayRequest => ({
    accountName: account.accountName,
    amount: amount,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    tenantName: account.tenant.getProperty("name"),
    type: "test",
  });

  const requests = range(0, 10).map(createRequests);

  const responses = await Promise.allSettled(requests.map(async (x) => {
    const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());
    return await asyncClientCall(client, "pay", x);
  }));

  expect(responses.every((x) => x.status === "fulfilled")).toBeTrue();

  await reloadEntity(account);

  expect(account.balance.toNumber()).toBe(100);

  const em = server.ext.orm.em.fork();

  expect(await em.count(PayRecord)).toBe(10);
});

it("returns NOT_FOUND if account is not found", async () => {
  const request = PayRequest.fromPartial({
    accountName: account.accountName + "123",
    amount: numberToMoney(10),
    comment: "comment",
    operatorId: "tester",
  });

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const ret = await asyncClientCall(client, "pay", request).catch((e) => e);

  expect(ret.code).toBe(grpc.status.NOT_FOUND);
});

it("gets account balance", async () => {

  account.balance = new Decimal(50);
  await em.flush();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const reply = await asyncClientCall(client, "getBalance", {
    tenantName: account.tenant.getEntity().name,
    accountName: account.accountName,
  });

  expect(moneyToNumber(reply.balance!)).toBe(50);
});

it("charges account", async () => {
  const amount = numberToMoney(10);

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const reply = await asyncClientCall(client, "charge", {
    tenantName: account.tenant.getProperty("name"),
    accountName: account.accountName,
    type: "123",
    amount: amount,
    comment: "comment",
  });

  expect(moneyToNumber(reply.previousBalance!)).toBe(0);
  expect(moneyToNumber(reply.currentBalance!)).toBe(-10);

  await reloadEntity(account);

  expect(account.balance.toNumber()).toBe(-10);
});

it("concurrently charges", async () => {
  const amount = numberToMoney(10);

  const createRequest = (): ChargeRequest => ({
    accountName: account.accountName,
    amount: amount,
    comment: "comment",
    tenantName: account.tenant.getProperty("name"),
    type: "test",
  });

  const requests = range(0, 10).map(createRequest);

  const responses = await Promise.allSettled(requests.map(async (x) => {
    const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());
    return await asyncClientCall(client, "charge", x);
  }));

  expect(responses.every((x) => x.status === "fulfilled")).toBeTrue();

  await reloadEntity(account);

  expect(account.balance.toNumber()).toBe(-100);

  const em = server.ext.orm.em.fork();

  expect(await em.count(ChargeRecord)).toBe(10);
});


it("returns payment records", async () => {
  const amount = numberToMoney(10);

  const request: PayRequest = {
    accountName: account.accountName,
    amount: amount,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    tenantName: account.tenant.getProperty("name"),
    type: "test",
  };

  const startTime = new Date();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  await asyncClientCall(client, "pay", request);

  await reloadEntity(account);
  expect(account.balance.toNumber()).toBe(10);

  const reply = await asyncClientCall(client, "getPaymentRecords", {
    accountName: account.accountName,
    startTime,
    endTime: new Date(),
  });

  expect(reply.results).toHaveLength(1);

  expect(reply.results[0]).toMatchObject({
    accountName: request.accountName,
    comment: request.comment,
    ipAddress: request.ipAddress,
    amount: request.amount,
  } as Partial<PaymentRecord>);
});
