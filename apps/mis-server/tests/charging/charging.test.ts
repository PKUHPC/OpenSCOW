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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal, moneyToNumber, numberToMoney } from "@scow/lib-decimal";
import { ChargeRequest, ChargingServiceClient, PaymentRecord, PayRequest } from "@scow/protos/build/server/charging";
import { createServer } from "src/app";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { PayRecord } from "src/entities/PayRecord";
import { Tenant } from "src/entities/Tenant";
import { range } from "src/utils/array";
import { reloadEntity } from "src/utils/orm";
import { dropDatabase } from "tests/data/helpers";


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
  await dropDatabase(server.ext.orm);
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

  await reloadEntity(em, account);

  expect(account.balance.toNumber()).toBe(10);
});

it ("pays account with negative amount", async () => {
  const amount = numberToMoney(-10);
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
  expect(moneyToNumber(reply.currentBalance!)).toBe(-10);

  await reloadEntity(em, account);

  expect(account.balance.toNumber()).toBe(-10);
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

  await reloadEntity(em, account);

  expect(account.balance.toNumber()).toBe(100);

  const em1 = server.ext.orm.em.fork();

  expect(await em1.count(PayRecord)).toBe(10);
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

  await reloadEntity(em, account);

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

  await reloadEntity(em, account);

  expect(account.balance.toNumber()).toBe(-100);

  const em1 = server.ext.orm.em.fork();

  expect(await em1.count(ChargeRecord)).toBe(10);
});


it("returns payment records", async () => {
  const amount1 = numberToMoney(10);
  const amount2 = numberToMoney(20);

  const request1: PayRequest = {
    accountName: account.accountName,
    tenantName: account.tenant.getProperty("name"),
    amount: amount1,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    type: "test",
  };

  const request2: PayRequest = {
    tenantName: account.tenant.getProperty("name"),
    amount: amount2,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    type: "test",
  };

  const startTime = new Date();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  await asyncClientCall(client, "pay", request1);
  await asyncClientCall(client, "pay", request2);

  await reloadEntity(em, account);
  await reloadEntity(em, account.tenant.getEntity());

  expect(account.balance.toNumber()).toBe(10);
  expect(account.tenant.getProperty("balance").toNumber()).toBe(20);

  // set accountName
  const reply1 = await asyncClientCall(client, "getPaymentRecords", {
    accountName: account.accountName,
    tenantName: account.tenant.getProperty("name"),
    startTime: startTime.toISOString(),
    endTime: new Date().toISOString(),
  });

  expect(reply1.results).toHaveLength(1);

  expect(reply1.results[0]).toMatchObject({
    accountName: request1.accountName,
    comment: request1.comment,
    ipAddress: request1.ipAddress,
    amount: request1.amount,
  } as Partial<PaymentRecord>);

  expect(reply1.total).toStrictEqual(numberToMoney(10));

  // not set accountName, set tenantName
  const reply2 = await asyncClientCall(client, "getPaymentRecords", {
    tenantName: account.tenant.getProperty("name"),
    startTime: startTime.toISOString(),
    endTime: new Date().toISOString(),
  });

  expect(reply2.results).toHaveLength(1);

  expect(reply2.results[0]).toMatchObject({
    tenantName: request2.tenantName,
    accountName: request2.accountName,
    comment: request2.comment,
    ipAddress: request2.ipAddress,
    amount: request2.amount,
  } as Partial<PaymentRecord>);

  expect(reply2.total).toStrictEqual(numberToMoney(20));

  // not set accountName, not set tenantName
  const reply3 = await asyncClientCall(client, "getPaymentRecords", {
    startTime: startTime.toISOString(),
    endTime: new Date().toISOString(),
  });

  expect(reply3.results).toHaveLength(1);

  expect(reply3.results[0]).toMatchObject({
    tenantName: request2.tenantName,
    accountName: request2.accountName,
    comment: request2.comment,
    ipAddress: request2.ipAddress,
    amount: request2.amount,
  } as Partial<PaymentRecord>);

  expect(reply3.total).toStrictEqual(numberToMoney(20));

});
