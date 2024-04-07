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
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal, decimalToMoney } from "@scow/lib-decimal";
import { dayjsToDateMessage } from "@scow/lib-server/build/date";
import { ChargingServiceClient } from "@scow/protos/build/server/charging";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { createServer } from "src/app";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { PayRecord } from "src/entities/PayRecord";
import { Tenant } from "src/entities/Tenant";
import { dropDatabase } from "tests/data/helpers";

dayjs.extend(utc);

let server: Server;
let em: SqlEntityManager;

beforeEach(async () => {

  server = await createServer();

  em = server.ext.orm.em.fork();

  const tenant = new Tenant({ name: "test" });

  const createAccount = (index: number) => new Account({
    accountName: `top${index}`,
    tenant,
    blockedInCluster: false,
    comment: `top${index}`,
  });

  const accounts = Array.from({ length: 10 }, (_, i) => createAccount(i + 1));

  const chargeRecords: ChargeRecord[] = [];
  const payRecords: PayRecord[] = [];
  const date = dayjs().startOf("day");

  accounts.forEach((account) => {
    const topNumber = +account.accountName.replace("top", "");
    const curDate = date.clone().subtract((topNumber - 1), "day");
    chargeRecords.push(
      new ChargeRecord({
        time: curDate.toDate(),
        target: account,
        type: "test",
        comment: "test",
        amount: new Decimal(100 * (11 - topNumber)),
      }),
    );
    payRecords.push(
      new PayRecord({
        time:  curDate.toDate(),
        target: account,
        type: "test",
        comment: "test",
        amount: new Decimal(100 * (11 - topNumber)),
        operatorId: "test",
        ipAddress: "127.0.0.1",
      }),
    );
  });


  await em.persistAndFlush([tenant, ...accounts, ...chargeRecords, ...payRecords]);

  await server.start();

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});


it("correct get Top 10 Charge Account", async () => {
  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const today = dayjs().startOf("day");

  const tenDaysAgo = today.clone().subtract(9, "day");

  const reply = await asyncClientCall(client, "getTopChargeAccount",
    { startTime: tenDaysAgo.toISOString(), endTime: today.toISOString(), topRank: 10 });

  const results = Array.from({ length: 10 }, (_, i) => ({
    accountName: `top${i + 1}`,
    chargedAmount: decimalToMoney(new Decimal(100 * (11 - (i + 1)))),
  }));

  expect(reply.results).toMatchObject(results);

});

it("correct get daily Charge Amount in UTC+8 timezone", async () => {
  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const today = dayjs().startOf("day");

  const tenDaysAgo = today.clone().subtract(9, "day");

  const reply = await asyncClientCall(client, "getDailyCharge", {
    startTime: tenDaysAgo.toISOString(),
    endTime: today.toISOString(),
    timeZone: "Asia/Shanghai",
  });

  const todayInUtcPlus8 = today.utcOffset(8);

  const results = Array.from({ length: 10 }, (_, i) => {
    const curDateInUtcPlus8 = todayInUtcPlus8.subtract(i, "day");
    return ({
      date: dayjsToDateMessage(curDateInUtcPlus8),
      amount: decimalToMoney(new Decimal(100 * (11 - (i + 1)))),
    });
  });

  expect(reply.results).toMatchObject(results);

});



it("correct get Top 10 Pay Account", async () => {
  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const today = dayjs().startOf("day");

  const tenDaysAgo = today.clone().subtract(9, "day");

  const reply = await asyncClientCall(client, "getTopPayAccount",
    { startTime: tenDaysAgo.toISOString(), endTime: today.toISOString(), topRank: 10 });

  const results = Array.from({ length: 10 }, (_, i) => ({
    accountName: `top${i + 1}`,
    payAmount: decimalToMoney(new Decimal(100 * (11 - (i + 1)))),
  }));

  expect(reply.results).toMatchObject(results);

});

it("correct get daily Pay Amount in UTC+8 timezone", async () => {
  const client = new ChargingServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const today = dayjs().startOf("day");

  const tenDaysAgo = today.clone().subtract(9, "day");

  const reply = await asyncClientCall(client, "getDailyPay", {
    startTime: tenDaysAgo.toISOString(),
    endTime: today.toISOString(),
    timeZone: "Asia/Shanghai",
  });

  const todayInUtcPlus8 = today.utcOffset(8);

  const results = Array.from({ length: 10 }, (_, i) => {
    const curDateInUtcPlus8 = todayInUtcPlus8.subtract(i, "day");
    return ({
      date: dayjsToDateMessage(curDateInUtcPlus8),
      amount: decimalToMoney(new Decimal(100 * (11 - (i + 1)))),
    });
  });


  expect(reply.results).toMatchObject(results);

});
