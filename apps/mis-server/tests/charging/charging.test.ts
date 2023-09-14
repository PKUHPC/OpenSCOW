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
import { CHARGE_TYPE_OTHERS } from "src/utils/constants";
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

it("pays account with negative amount to block account", async () => {
  const amount = numberToMoney(5);
  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());
  await asyncClientCall(client, "pay", {
    tenantName: account.tenant.getProperty("name"),
    accountName: account.accountName,
    amount: amount,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    type: "test",
  });

  expect(account.blocked).toBe(false);
  const amount2 = numberToMoney(-5);
  const reply = await asyncClientCall(client, "pay", {
    tenantName: account.tenant.getProperty("name"),
    accountName: account.accountName,
    amount: amount2,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    type: "test",
  });

  await reloadEntity(em, account);

  expect(moneyToNumber(reply.previousBalance!)).toBe(5);
  expect(moneyToNumber(reply.currentBalance!)).toBe(0);
  expect(account.blocked).toBe(true);

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
  const tenant = await em.findOne(Tenant, { name:"test" }) as Tenant;
  const tenant2 = new Tenant({ name: "test2" });
  const account2 = new Account({ accountName: "1234", tenant, blocked: false, comment: "test" });
  await em.persistAndFlush([tenant2, account2]);

  const amount1 = numberToMoney(10);
  const amount2 = numberToMoney(20);
  const amount3 = numberToMoney(30);
  const amount4 = numberToMoney(40);

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

  const request3: PayRequest = {
    accountName: account2.accountName,
    tenantName: account2.tenant.getProperty("name"),
    amount: amount3,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    type: "test",
  };

  const request4: PayRequest = {
    tenantName: tenant2.name,
    amount: amount4,
    comment: "comment",
    operatorId: "tester",
    ipAddress: "127.0.0.1",
    type: "test",
  };


  const startTime = new Date();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  await asyncClientCall(client, "pay", request1);
  await asyncClientCall(client, "pay", request2);
  await asyncClientCall(client, "pay", request3);
  await asyncClientCall(client, "pay", request4);

  await reloadEntity(em, account);
  await reloadEntity(em, account.tenant.getEntity());

  expect(account.balance.toNumber()).toBe(10);
  expect(account.tenant.getProperty("balance").toNumber()).toBe(20);

  // accountOfTenant
  const reply1 = await asyncClientCall(client, "getPaymentRecords", {
    startTime: startTime.toISOString(),
    endTime: new Date().toISOString(),
    target:{ $case:"accountOfTenant", accountOfTenant:{ accountName: account.accountName,
      tenantName: account.tenant.getProperty("name") } },
  });

  expect(reply1.results).toHaveLength(1);

  expect(reply1.results[0]).toMatchObject({
    accountName: request1.accountName,
    comment: request1.comment,
    ipAddress: request1.ipAddress,
    amount: request1.amount,
  } as Partial<PaymentRecord>);

  expect(reply1.total).toStrictEqual(numberToMoney(10));

  // tenant
  const reply2 = await asyncClientCall(client, "getPaymentRecords", {
    target:{ $case:"tenant", tenant:{ tenantName: account.tenant.getProperty("name") } },
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

  // allTenants
  const reply3 = await asyncClientCall(client, "getPaymentRecords", {
    target:{ $case: "allTenants", allTenants:{} },
    startTime: startTime.toISOString(),
    endTime: new Date().toISOString(),
  });

  expect(reply3.results).toHaveLength(2);

  expect(reply3.results).toMatchObject([
    {
      tenantName: request4.tenantName,
      accountName: request4.accountName,
      comment: request4.comment,
      ipAddress: request4.ipAddress,
      amount: request4.amount,
    }, {
      tenantName: request2.tenantName,
      accountName: request2.accountName,
      comment: request2.comment,
      ipAddress: request2.ipAddress,
      amount: request2.amount,
    } ] as Partial<PaymentRecord>);

  expect(reply3.total).toStrictEqual(numberToMoney(60));

  // accountsOfTenant
  const reply4 = await asyncClientCall(client, "getPaymentRecords", {
    startTime: startTime.toISOString(),
    endTime: new Date().toISOString(),
    target:{ $case:"accountsOfTenant", accountsOfTenant:{
      tenantName: account.tenant.getProperty("name") } },
  });

  expect(reply4.results).toHaveLength(2);

  expect(reply4.results).toMatchObject([
    {
      accountName: request3.accountName,
      comment: request3.comment,
      ipAddress: request3.ipAddress,
      amount: request3.amount,
    },
    {
      accountName: request1.accountName,
      comment: request1.comment,
      ipAddress: request1.ipAddress,
      amount: request1.amount,
    },
  ]as Partial<PaymentRecord>);

  expect(reply4.total).toStrictEqual(numberToMoney(40));
});

it("returns charge records with query of accountOfTenant", async () => {

  const amount1 = numberToMoney(10);

  const request1: ChargeRequest = {
    accountName: account.accountName,
    tenantName: account.tenant.getProperty("name"),
    amount: amount1,
    comment: "comment",
    type: "test",
  };

  const startTime = new Date();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  await asyncClientCall(client, "charge", request1);

  await reloadEntity(em, account);
  await reloadEntity(em, account.tenant.getEntity());

  expect(account.balance.toNumber()).toBe(-10);
  expect(account.tenant.getProperty("balance").toNumber()).toBe(0);

  const queryStartTime = new Date(startTime);
  queryStartTime.setDate(startTime.getDate() - 1);
  const queryEndTime = new Date(startTime);
  queryEndTime.setDate(startTime.getDate() + 1);

  // accountOfTenant
  const reply1 = await asyncClientCall(client, "getChargeRecords", {
    startTime: queryStartTime.toISOString(),
    endTime: queryEndTime.toISOString(),
    target:{ $case:"accountOfTenant", accountOfTenant:{ accountName: account.accountName,
      tenantName: account.tenant.getProperty("name") } },
  });

  expect(reply1.results).toHaveLength(1);

  expect(reply1.results[0]).toMatchObject({
    accountName: request1.accountName,
    comment: request1.comment,
    amount: request1.amount,
  } as Partial<ChargeRecord>);

  expect(reply1.total).toStrictEqual(numberToMoney(10));

  em.clear();
});

it("returns charge records with query of tenant", async () => {
  const tenant = await em.findOne(Tenant, { name:"test" }) as Tenant;

  const amount1 = numberToMoney(10);
  const amount2 = numberToMoney(20);

  const request1: ChargeRequest = {
    tenantName: tenant.name,
    amount: amount1,
    comment: "comment",
    type: "test1",
  };
  const request2: ChargeRequest = {
    tenantName: tenant.name,
    amount: amount2,
    comment: "comment",
    type: "test2",
  };

  const startTime = new Date();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  await asyncClientCall(client, "charge", request1);
  await asyncClientCall(client, "charge", request2);

  await reloadEntity(em, tenant);

  expect(tenant.balance.toNumber()).toBe(-30);

  const queryStartTime = new Date(startTime);
  queryStartTime.setDate(startTime.getDate() - 1);
  const queryEndTime = new Date(startTime);
  queryEndTime.setDate(startTime.getDate() + 1);

  // tenant
  const reply = await asyncClientCall(client, "getChargeRecords", {
    target:{ $case:"tenant", tenant:{ tenantName: tenant.name } },
    startTime: queryStartTime.toISOString(),
    endTime: queryEndTime.toISOString(),
  });

  expect(reply.results).toHaveLength(2);

  expect(reply.results).toMatchObject([
    {
      tenantName: tenant.name,
      accountName: undefined,
      comment: request1.comment,
      amount: request1.amount,
      type: request1.type,
    }, {
      tenantName: tenant.name,
      accountName: undefined,
      comment: request2.comment,
      amount: request2.amount,
      type: request2.type,
    } ] as Partial<ChargeRecord>);

  expect(reply.total).toStrictEqual(numberToMoney(30));

  em.clear();
});

it("returns charge records with query of allTenants", async () => {

  const tenant = await em.findOne(Tenant, { name:"test" }) as Tenant;
  const tenant2 = new Tenant({ name: "test2" });
  const account2 = new Account({ accountName: "1234", tenant, blocked: false, comment: "test" });
  await em.persistAndFlush([tenant2, account2]);

  const amount1 = numberToMoney(10);
  const amount2 = numberToMoney(20);
  const amount3 = numberToMoney(30);
  const amount4 = numberToMoney(40);

  const request1: ChargeRequest = {
    accountName: account.accountName,
    tenantName: account.tenant.getProperty("name"),
    amount: amount1,
    comment: "comment",
    type: "test1",
  };

  const request2: ChargeRequest = {
    tenantName: account.tenant.getProperty("name"),
    amount: amount2,
    comment: "comment",
    type: "test1",
  };

  const request3: ChargeRequest = {
    accountName: account2.accountName,
    tenantName: account2.tenant.getProperty("name"),
    amount: amount3,
    comment: "comment",
    type: "test1",
  };

  const request4: ChargeRequest = {
    tenantName: tenant2.name,
    amount: amount4,
    comment: "comment",
    type: "BBBB",
  };

  const startTime = new Date();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  await asyncClientCall(client, "charge", request1);
  await asyncClientCall(client, "charge", request2);
  await asyncClientCall(client, "charge", request3);
  await asyncClientCall(client, "charge", request4);

  await reloadEntity(em, account);
  await reloadEntity(em, account.tenant.getEntity());

  expect(account.balance.toNumber()).toBe(-10);
  expect(account.tenant.getProperty("balance").toNumber()).toBe(-20);

  const queryStartTime = new Date(startTime);
  queryStartTime.setDate(startTime.getDate() - 1);
  const queryEndTime = new Date(startTime);
  queryEndTime.setDate(startTime.getDate() + 1);

  // allTenants
  const reply = await asyncClientCall(client, "getChargeRecords", {
    target:{ $case: "allTenants", allTenants:{} },
    startTime: queryStartTime.toISOString(),
    endTime: queryEndTime.toISOString(),
    type: "test1",
  });

  expect(reply.results).toHaveLength(1);

  expect(reply.results[0]).toMatchObject(
    {
      tenantName: request2.tenantName,
      accountName: undefined,
      comment: request2.comment,
      amount: request2.amount,
      type: "test1",
    } as Partial<ChargeRecord>);

  expect(reply.total).toStrictEqual(numberToMoney(20));

  em.clear();
});

it("returns charge records with query of accountsOfTenant", async () => {
  const tenant = await em.findOne(Tenant, { name:"test" }) as Tenant;
  const tenant2 = new Tenant({ name: "test2" });
  const account2 = new Account({ accountName: "1234", tenant, blocked: false, comment: "test" });
  await em.persistAndFlush([tenant2, account2]);

  const amount1 = numberToMoney(10);
  const amount2 = numberToMoney(30);

  const request1: ChargeRequest = {
    accountName: account.accountName,
    tenantName: account.tenant.getProperty("name"),
    amount: amount1,
    comment: "comment",
    type: "testAAA",
  };

  const request2: ChargeRequest = {
    accountName: account2.accountName,
    tenantName: account2.tenant.getProperty("name"),
    amount: amount2,
    comment: "comment",
    type: "testBBB",
  };
  const startTime = new Date();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  await asyncClientCall(client, "charge", request1);
  await asyncClientCall(client, "charge", request2);

  await reloadEntity(em, account);
  await reloadEntity(em, account.tenant.getEntity());

  expect(account.balance.toNumber()).toBe(-10);
  expect(account.tenant.getProperty("balance").toNumber()).toBe(0);

  const queryStartTime = new Date(startTime);
  queryStartTime.setDate(startTime.getDate() - 1);
  const queryEndTime = new Date(startTime);
  queryEndTime.setDate(startTime.getDate() + 1);

  // accountsOfTenant
  const reply = await asyncClientCall(client, "getChargeRecords", {
    startTime: queryStartTime.toISOString(),
    endTime: queryEndTime.toISOString(),
    target:{ $case:"accountsOfTenant", accountsOfTenant:{
      tenantName: account.tenant.getProperty("name") } },
    type: CHARGE_TYPE_OTHERS,
  });

  expect(reply.results).toHaveLength(2);

  expect(reply.results).toMatchObject([
    {
      accountName: request1.accountName,
      tenantName: account.tenant.getProperty("name"),
      comment: request1.comment,
      amount: request1.amount,
      type: request1.type,
    },
    {
      accountName: request2.accountName,
      tenantName: account.tenant.getProperty("name"),
      comment: request2.comment,
      amount: request2.amount,
      type: request2.type,
    },
  ]as Partial<ChargeRecord>);

  expect(reply.total).toStrictEqual(numberToMoney(40));

  em.clear();
});

it("returns charge records with query allAccountOfAllTenants", async () => {
  const tenant = await em.findOne(Tenant, { name:"test" }) as Tenant;
  const tenant2 = new Tenant({ name: "test2" });
  const account2 = new Account({ accountName: "1234", tenant, blocked: false, comment: "test" });
  await em.persistAndFlush([tenant2, account2]);

  const amount1 = numberToMoney(10);
  const amount2 = numberToMoney(20);
  const amount3 = numberToMoney(30);
  const amount4 = numberToMoney(40);

  const request1: ChargeRequest = {
    accountName: account.accountName,
    tenantName: account.tenant.getProperty("name"),
    amount: amount1,
    comment: "comment",
    type: "testA",
  };

  const request2: ChargeRequest = {
    tenantName: account.tenant.getProperty("name"),
    amount: amount2,
    comment: "comment",
    type: "testB",
  };

  const request3: ChargeRequest = {
    accountName: account2.accountName,
    tenantName: account2.tenant.getProperty("name"),
    amount: amount3,
    comment: "comment",
    type: "testC",
  };

  const request4: ChargeRequest = {
    tenantName: tenant2.name,
    amount: amount4,
    comment: "comment",
    type: "testD",
  };

  const startTime = new Date();

  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  await asyncClientCall(client, "charge", request1);
  await asyncClientCall(client, "charge", request2);
  await asyncClientCall(client, "charge", request3);
  await asyncClientCall(client, "charge", request4);

  await reloadEntity(em, account);
  await reloadEntity(em, account.tenant.getEntity());

  expect(account.balance.toNumber()).toBe(-10);
  expect(account.tenant.getProperty("balance").toNumber()).toBe(-20);

  const queryStartTime = new Date(startTime);
  queryStartTime.setDate(startTime.getDate() - 1);
  const queryEndTime = new Date(startTime);
  queryEndTime.setDate(startTime.getDate() + 1);

  // accountsOfAllTenants
  const reply = await asyncClientCall(client, "getChargeRecords", {
    startTime: queryStartTime.toISOString(),
    endTime: queryEndTime.toISOString(),
    target:{ $case:"accountsOfAllTenants", accountsOfAllTenants:{ } },
  });

  expect(reply.results).toHaveLength(2);

  expect(reply.results).toMatchObject([
    {
      accountName: request1.accountName,
      tenantName: request1.tenantName,
      comment: request1.comment,
      amount: request1.amount,
      type: request1.type,
    },
    {
      accountName: request3.accountName,
      tenantName: request3.tenantName,
      comment: request3.comment,
      amount: request3.amount,
      type: request3.type,
    },
  ]as Partial<ChargeRecord>);

  expect(reply.total).toStrictEqual(numberToMoney(40));

  em.clear();
});


