/* eslint-disable max-len */
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { createServer } from "src/app";
import { Account } from "src/entities/Account";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { AdminServiceClient } from "src/generated/server/admin";
import { dropDatabase } from "tests/data/helpers";

let server: Server;
let orm: MikroORM<MySqlDriver>;
let client: AdminServiceClient;

beforeEach(async () => {
  server = await createServer();
  await server.start();

  client = new AdminServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  orm = server.ext.orm;
});

afterEach(async () => {
  await dropDatabase(orm);
  await server.close();
});

const usersJson = {
  "accounts": {
    "a_abc": {
      "abc": "allowed!,owner",
      "yhh": "blocked!",
    },
    "a_b": {
      "yhh": "allowed!,owner",
    },
  },
  "names": {
    "abc": "abcName",
  },
};

it("imports users and accounts from users.json", async () => {
  await asyncClientCall(client, "importUsers", { data: JSON.stringify(usersJson), whitelist: true });

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
