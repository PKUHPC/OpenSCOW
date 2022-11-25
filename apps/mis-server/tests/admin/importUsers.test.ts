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

jest.mock("@scow/lib-auth", () => ({
  getCapabilities: jest.fn(async () => ({
    createUser: true,
    changePassword: true,
    validateName: true,
  })),
}));

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

const data = {
  accounts: [
    {
      accountName: "a_user1",
      users: [{ userId: "user1", state: "allowed!" }, { userId: "user2", state: "blocked!" }],
      owner: "user1",
    },
    {
      accountName: "account2",
      users: [{ userId: "user2", state: "allowed!" }, { userId: "user3", state: "blocked!" }],
      owner: "user2",
    },
  ],
  users: [ 
    { userId: "user1", userName: "user1Name", accounts: [ "a_user1" ]}, 
    { userId: "user2", userName: "user2", accounts: [ "a_user1", "account2" ]}, 
    { userId: "user3", userName: "", accounts: [ "account2" ]},
  ],
};

it("imports users and accounts from users.json", async () => {
  await asyncClientCall(client, "importUsers", { data: data, whitelist: true });

  const em = orm.em.fork();

  const accounts = await em.find(Account, {});
  expect(accounts.map((x) => x.accountName)).toIncludeSameMembers(data.accounts.map((x) => x.accountName));

  const ua = await em.find(UserAccount, { }, {
    populate: ["account", "user"],
  });
  expect(ua.map((x) => ({ accountName: x.account.$.accountName, userId: x.user.$.userId, role: x.role, blocked: x.status === UserStatus.BLOCKED })))
    .toIncludeSameMembers([
      { accountName: "a_user1", userId: "user1", role: UserRole.OWNER, blocked: false },
      { accountName: "a_user1", userId: "user2", role: UserRole.USER, blocked: true },
      { accountName: "account2", userId: "user2", role: UserRole.OWNER, blocked: false },
      { accountName: "account2", userId: "user3", role: UserRole.USER, blocked: true },
    ]);

  const users = await em.find(User, { });
  expect(users.map((x) => ({ userId: x.userId, name: x.name })))
    .toIncludeSameMembers([
      { userId: "user1", name: "user1Name" },
      { userId: "user2", name: "user2" },
      { userId: "user3", name: "user3" },
    ]);
});
