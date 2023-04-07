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
import { AccountServiceClient } from "@scow/protos/build/server/account";
import { createServer } from "src/app";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { dropDatabase } from "tests/data/helpers";

let server: Server;
let client: AccountServiceClient;
let account: Account;
let tenant: Tenant;
let user: User;

beforeEach(async () => {
  server = await createServer();
  await server.start();
  await server.ext.orm.em.fork().persistAndFlush(account);

  tenant = new Tenant({ name: "tenant" });
  await server.ext.orm.em.fork().persistAndFlush(tenant);

  user = new User({ name: "test", userId: "test", tenant: tenant, email:"test@test.com" });
  await server.ext.orm.em.fork().persistAndFlush(user);

  client = new AccountServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});


it("create a new account", async () => {
  await asyncClientCall(client, "createAccount", { accountName: "a1234", tenantName: tenant.name,
    ownerId: user.userId });
  const em = server.ext.orm.em.fork();

  const account = await em.findOneOrFail(Account, { accountName: "a1234" });
  expect(account.accountName).toBe("a1234");
});


it("cannot create a account if the name exists", async () => {
  const account = new Account({ accountName: "123", tenant, blocked: false, comment: "test" });
  await server.ext.orm.em.fork().persistAndFlush(account);

  const reply = await asyncClientCall(client, "createAccount", {
    accountName: "123", tenantName: "tenant",
    ownerId: user.userId,
  }).catch((e) => e);
  expect(reply.code).toBe(Status.ALREADY_EXISTS);
});


