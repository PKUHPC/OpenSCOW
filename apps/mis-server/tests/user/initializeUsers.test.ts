/* eslint-disable max-len */
import { Server } from "@ddadaal/tsgrpc-server";
import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { createServer } from "src/app";
import { Account } from "src/entities/Account";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { initializeUsers } from "src/tasks/initializeUsers";
import {  dropDatabase } from "tests/data/helpers";

import usersJson from "../data/config/users.json";

let server: Server;
let orm: MikroORM<MySqlDriver>;

beforeEach(async () => {
  server = await createServer();

  orm = server.ext.orm;
});

afterEach(async () => {
  await dropDatabase(orm);
  await server.close();
});

it("imports users and accounts from users.json", async () => {
  await initializeUsers(orm.em.fork(), true, server.logger, "tests/data/config");

  const em = orm.em.fork();


  const accounts = await em.find(Account, {});
  expect(accounts.map((x) => x.accountName)).toIncludeSameMembers(Object.keys(usersJson.accounts));

  const ua = await em.find(UserAccount, { }, {
    populate: ["account", "user"],
  });
  expect(ua.map((x) => ({ accountName: x.account.$.accountName, userId: x.user.$.userId, role: x.role, blocked: x.status === UserStatus.BLOCKED })))
    .toIncludeSameMembers([
      { accountName: "a_abc", userId: "abc", role: UserRole.OWNER, blocked: false },
      { accountName: "a_abc", userId: "yhh", role: UserRole.USER, blocked: true },
      { accountName: "a_b", userId: "yhh", role: UserRole.OWNER, blocked: false },
    ]);

  const users = await em.find(User, { });
  expect(users.map((x) => ({ userId: x.userId, name: x.name })))
    .toIncludeSameMembers([
      { userId: "abc", name: "abcName" },
      { userId: "yhh", name: "yhh" },
    ]);





});
