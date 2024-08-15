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
import { Account, AccountState } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
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
  const account = new Account({
    accountName: "123", tenant,
    blockedInCluster: false,
    comment: "test",
  });
  await server.ext.orm.em.fork().persistAndFlush(account);

  const reply = await asyncClientCall(client, "createAccount", {
    accountName: "123", tenantName: "tenant",
    ownerId: user.userId,
  }).catch((e) => e);
  expect(reply.code).toBe(Status.ALREADY_EXISTS);
});


it("delete account", async () => {
  const em = server.ext.orm.em.fork();

  const userA = new User({
    name: "testA",
    userId: "testA",
    email: "testA@test.com",
    tenant,
  });

  const accountA = new Account({
    accountName: "accountA",
    tenant,
    blockedInCluster: false,
    comment: "test",
  });

  const userAccount = new UserAccount({
    user,
    account: accountA,
    role: UserRole.ADMIN,
    blockedInCluster: UserStatus.UNBLOCKED,
  });

  const userAccountA = new UserAccount({
    user:userA,
    account: accountA,
    role: UserRole.OWNER,
    blockedInCluster: UserStatus.UNBLOCKED,
  }); ;

  const whitelist = new AccountWhitelist({
    account: accountA,
    comment: "",
    operatorId: "123",
    time: new Date("2023-01-01T00:00:00.000Z"),
    expirationTime:new Date("2025-01-01T00:00:00.000Z"),
  });

  await em.persistAndFlush([userA,accountA,userAccount, userAccountA,whitelist]);

  const initialAccountCount = await em.count(UserAccount, { account:accountA });
  expect(initialAccountCount).toBe(2);
  const whitelistedAccount = await asyncClientCall(client, "getWhitelistedAccounts", {
    tenantName: accountA.tenant.getProperty("name"),
  });
  expect(whitelistedAccount.accounts.length).toBe(1);


  // 执行删除账户操作
  await asyncClientCall(client, "deleteAccount", {
    tenantName: accountA.tenant.getProperty("name"),
    accountName: accountA.accountName,
  });

  em.clear();

  // 确认账户被删除
  const remainingUserAccountCount = await em.count(UserAccount, { account:accountA });
  expect(remainingUserAccountCount).toBe(1);

  const updatedAccountA = await em.findOneOrFail(Account, { accountName: "accountA" });
  expect(updatedAccountA.state).toBe(AccountState.DELETED);

  const remainingWhitelistedAccounts = await asyncClientCall(client, "getWhitelistedAccounts", {
    tenantName: accountA.tenant.getProperty("name"),
  });
  expect(remainingWhitelistedAccounts.accounts.length).toBe(0);
});


it("cannot delete account with jobs running", async () => {
  const em = server.ext.orm.em.fork();

  const accountA = new Account({
    accountName: "hpca",// 和测试数据中有的数据保持一致
    tenant,
    blockedInCluster: false,
    comment: "test",
  });

  const userAccount = new UserAccount({
    user,
    account: accountA,
    role: UserRole.OWNER,
    blockedInCluster: UserStatus.UNBLOCKED,
  });

  await em.persistAndFlush([accountA,userAccount]);

  // 假设 accountA 有正在进行的作业，无法删除
  const reply = await asyncClientCall(client, "deleteAccount", {
    tenantName: accountA.tenant.getProperty("name"),
    accountName: accountA.accountName,
  }).catch((e) => e);

  expect(reply.code).toBe(Status.FAILED_PRECONDITION);

  // 确认账户仍然存在
  const updatedAccountA = await em.findOneOrFail(Account, { accountName: "hpca" });
  expect(updatedAccountA.state).toBe(AccountState.NORMAL);
  const remainingUserAccountCount = await em.count(UserAccount, { account:accountA });
  expect(remainingUserAccountCount).toBe(1);
});
