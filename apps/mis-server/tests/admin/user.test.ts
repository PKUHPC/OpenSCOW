import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { createServer } from "src/app";
import { misConfig } from "src/config/mis";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { UserServiceClient } from "src/generated/server/user";
import { reloadEntity } from "src/utils/orm";
import { insertInitialData } from "tests/data/data";
import { dropDatabase } from "tests/data/helpers";
import { fetch } from "undici";


const anotherTenant = "anotherTenant";

let server: Server;
let client: UserServiceClient;

let tenant: Tenant;

const password = "test";

beforeEach(async () => {
  server = await createServer();
  await server.start();

  tenant = new Tenant({ name: anotherTenant });

  await server.ext.orm.em.fork().persistAndFlush(tenant);

  client = new UserServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("creates user", async () => {

  const name = "123";
  const userId = "2";
  const email = "test@test.com";

  await asyncClientCall(client, "createUser", { name, identityId: userId, email, tenantName: tenant.name, password });

  const em = server.ext.orm.em.fork();

  const user = await em.findOneOrFail(User, { userId });

  expect(user.name).toBe(name);

  expect(fetch).toHaveBeenNthCalledWith(
    1,
    misConfig.authUrl + "/user",
    {
      method: "POST",
      body: JSON.stringify({
        identityId: userId,
        id: user.id,
        mail: email,
        name: name,
        password,
      }),
      headers: {
        "content-type": "application/json",
      },
    },
  );
});

it("cannot create user if userId exists", async () => {
  const name = "123";
  const userId = "2";
  const email = "test@test.com";

  const user = new User({ name, userId, email, tenant });
  await server.ext.orm.em.fork().persistAndFlush(user);

  const reply = await asyncClientCall(client, "createUser", {
    name, identityId: userId, email, tenantName: tenant.name, password,
  }).catch((e) => e);

  expect(reply.code).toBe(Status.ALREADY_EXISTS);
});

it("cannot remove owner from account", async () => {
  const data = await insertInitialData(server.ext.orm.em.fork());

  const reply = await asyncClientCall(client, "removeUserFromAccount", {
    tenantName: data.tenant.name,
    accountName: data.accountA.accountName,
    userId: data.userA.userId,
  }).catch((e) => e);

  expect(reply.code).toBe(Status.OUT_OF_RANGE);
});

it("deletes user", async () => {
  const em = server.ext.orm.em.fork();
  const data = await insertInitialData(em);

  const user = new User({
    name: "test", userId: "test", email: "test@test.com",
    tenant: data.tenant,
  });
  data.accountA.users.add(new UserAccount({
    user, account: data.accountA, role: UserRole.USER, status: UserStatus.BLOCKED,
  }));

  await em.persistAndFlush([user]);

  em.clear();

  expect(await em.count(UserAccount, { account: data.accountA })).toBe(3);
  expect(await em.count(User, { tenant: data.tenant })).toBe(3);

  await asyncClientCall(client, "deleteUser", {
    tenantName: user.tenant.getProperty("name"),
    userId: user.userId,
  });

  await reloadEntity(data.accountA);

  expect(await em.count(UserAccount, { account: data.accountA })).toBe(2);
  expect(await em.count(User, { tenant: data.tenant })).toBe(2);
});

it("cannot delete owner", async () => {
  const data = await insertInitialData(server.ext.orm.em.fork());

  const reply = await asyncClientCall(client, "deleteUser", {
    tenantName: data.tenant.name,
    userId: data.userA.userId,
  }).catch((e) => e);

  expect(reply.code).toBe(Status.FAILED_PRECONDITION);

  expect(await server.ext.orm.em.count(UserAccount, { account: data.accountA })).toBe(2);
  expect(await server.ext.orm.em.count(User, { tenant: data.tenant })).toBe(2);
});

it("get all users", async () => {
  const data = await insertInitialData(server.ext.orm.em.fork());

  const users = await asyncClientCall(client, "getAllUsers", {
    page: 1,
    pageSize: 10,
  });

  expect(users.totalCount).toBe(3);
  expect(users.platformUsers.map((x) => ({ 
    userId: x.userId, 
    name: x.name, 
    createTime: x.createTime, 
    platformRoles: x.platformRoles,
  }))).toIncludeSameMembers([
    {
      userId: data.userA.userId,
      name: data.userA.name,
      createTime: data.userA.createTime,
      platformRoles: data.userA.platformRoles,
    },
    {
      userId: data.userB.userId,
      name: data.userB.name,
      createTime: data.userB.createTime,
      platformRoles: data.userB.platformRoles,
    },
    {
      userId: data.userC.userId,
      name: data.userC.name,
      createTime: data.userC.createTime,
      platformRoles: data.userC.platformRoles,
    },
  ]);
});