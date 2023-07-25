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
import { Status } from "@grpc/grpc-js/build/src/constants";
import { decimalToMoney } from "@scow/lib-decimal";
import { AccountServiceClient } from "@scow/protos/build/server/account";
import { createServer } from "src/app";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { InitialData, insertInitialData } from "tests/data/data";
import { dropDatabase } from "tests/data/helpers";


let server: Server;
let data: InitialData;

beforeEach(async () => {

  server = await createServer();

  const em = server.ext.orm.em.fork();

  data = await insertInitialData(em);

  await server.start();

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("account does not have an owner", async () => {
  const client = new AccountServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const reply = await asyncClientCall(client, "getAllAccounts", {}).catch((e) => e);

  expect(reply.code).toBe(Status.INTERNAL);
  expect(reply.message).toBe("13 INTERNAL: Account hpcc does not have an owner");
});

it("gets all accounts", async () => {
  const client = new AccountServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const em = server.ext.orm.em.fork();
  const anotherTenant = await em.findOne(Tenant, { name: "another" }) as Tenant;
  const userD = new User({ tenant: anotherTenant, email: "123", name: "dName", userId: "d" });
  const accountC = await em.findOne(Account, { accountName: "hpcc" }) as Account;
  const uaCD = new UserAccount({ user: userD, account: accountC, role: UserRole.OWNER, status: UserStatus.BLOCKED });
  await em.persistAndFlush([userD, uaCD]);
  
  const resp = await asyncClientCall(client, "getAllAccounts", {});

  expect(resp.results).toIncludeSameMembers([
    {
      "accountName": "hpca",
      "blocked": false,
      "ownerId": "a",
      "ownerName": "AName",
      "userCount": 2,
      "comment": "",
      "tenantName": data.tenant.name,
      balance: decimalToMoney(data.accountA.balance),
    },
    { "accountName": "hpcb",
      "blocked": false,
      "ownerId": "b",
      "ownerName": "BName",
      "userCount": 1,
      "tenantName": data.tenant.name,
      comment: "",
      balance: decimalToMoney(data.accountB.balance),
    },
    { "accountName": "hpcc",
      "blocked": false,
      "ownerId": "d",
      "ownerName": "dName",
      "userCount": 2,
      "tenantName": data.anotherTenant.name,
      comment: "123",
      balance: decimalToMoney(data.accountC.balance),
    },
  ]);
});
