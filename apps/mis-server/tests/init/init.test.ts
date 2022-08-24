import { Server } from "@ddadaal/tsgrpc-server";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { ChannelCredentials, status } from "@grpc/grpc-js";
import { createServer } from "src/app";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { CreateInitAdminRequest, InitServiceClient } from "src/generated/server/init";
import { dropDatabase } from "tests/data/helpers";

let server: Server;
let client: InitServiceClient;


beforeEach(async () => {
  server = await createServer();
  await server.start();
  client = new InitServiceClient(server.serverAddress, ChannelCredentials.createInsecure());
});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("querys init state and updates if complete", async () => {

  const queryInitialized = async () => {
    const reply = await asyncClientCall(client, "querySystemInitialized", {});
    return reply.initialized;
  };

  expect(await queryInitialized()).toBeFalse();

  await asyncClientCall(client, "completeInit", {});
  expect(await queryInitialized()).toBeTrue();
});

it("fails to complete if already init", async () => {
  await asyncClientCall(client, "completeInit", {});

  try {
    await asyncClientCall(client, "completeInit", {});
    fail();
  } catch (e) {
    expect(e).toMatchObject({ code: status.ALREADY_EXISTS });
  }

});

it("creates an init admin user", async () => {
  const userInfo: CreateInitAdminRequest = {
    email: "test@test.com",
    name: "123",
    userId: "123",
  };

  await asyncClientCall(client, "createInitAdmin", userInfo);

  const em = server.ext.orm.em.fork();

  const user = await em.findOneOrFail(User, { userId: userInfo.userId });

  expect(user).toMatchObject(userInfo);
  expect(user.platformRoles).toIncludeSameMembers([PlatformRole.PLATFORM_ADMIN]);
  expect(user.tenantRoles).toIncludeSameMembers([TenantRole.TENANT_ADMIN]);
});

