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
import { ChannelCredentials, status } from "@grpc/grpc-js";
import { sftpExists, sftpStat, sshConnect } from "@scow/lib-ssh";
import { createServer } from "src/app";
import { createSlurmOps } from "src/clusterops/slurm";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { Tenant } from "src/entities/Tenant";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { CreateInitAdminRequest, InitServiceClient,
  SetAsInitAdminRequest, UnsetInitAdminRequest } from "src/generated/server/init";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { createUserInDatabase } from "src/utils/createUser";
import { reloadEntities, toRef } from "src/utils/orm";
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

it("Test function userExist", async () => {
  const identityId = "test01";
  const name = "test01";
  const email = "test01@test01.com";
  const password = "pwd...123";
  const em = server.ext.orm.em.fork();
  const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });
  const user = new User({
    email, name, tenant, userId: identityId,
    platformRoles: [PlatformRole.PLATFORM_ADMIN], tenantRoles: [TenantRole.TENANT_ADMIN],
  });
  await createUserInDatabase(user, password, server.logger, em);
  const result = await asyncClientCall(client, "userExists", {
    userId: identityId,
  });
  expect(result.existsInScow).toBe(true);
});

it("To test whether the slurm.sh is automatically copied successfully", async () => {
  const ops = createSlurmOps("hpc00", server.logger);
  if (!ops) {
    throw new Error("The cluster configuration file does not exist");
  }
  await ops.onStartup();
  const testSlurmMisConfig00 = clusters["hpc00"].slurm.mis;
  if (!testSlurmMisConfig00) {
    throw new Error("The cluster configuration file does not exist");
  }
  await sshConnect(testSlurmMisConfig00.managerUrl, "test", rootKeyPair, server.logger, async (ssh) => {
    const sftp = await ssh.requestSFTP();
    // 测试指定路径是否存在slurm.sh文件
    const result = await sftpExists(sftp, testSlurmMisConfig00.scriptPath);
    expect(result).toEqual(true);
    // 解析出文件mode低9位权限字段并测试是否为555
    const stats = await sftpStat(sftp)(testSlurmMisConfig00.scriptPath);
    const testNumberPermission = (stats.mode & parseInt("777", 8)).toString(8);
    expect(testNumberPermission).toEqual("555");
  });
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
    password: "pwd...123",
    existsInAuth: false,
  };
  await asyncClientCall(client, "createInitAdmin", userInfo);

  const em = server.ext.orm.em.fork();

  const user = await em.findOneOrFail(User, { userId: userInfo.userId });

  expect(user).toMatchObject({
    email: userInfo.email,
    name: userInfo.name,
    userId: userInfo.userId,
  });
  expect(user.platformRoles).toIncludeSameMembers([PlatformRole.PLATFORM_ADMIN]);
  expect(user.tenantRoles).toIncludeSameMembers([TenantRole.TENANT_ADMIN]);
});


it("sets an user as platforn admin and tenant admin", async () => {

  // create an user
  const em = server.ext.orm.em.fork();
  const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

  const user = new User({ email: "test@test.com", name: "123", tenant: toRef(tenant), userId: "123" });
  await em.persistAndFlush(user);

  const request: SetAsInitAdminRequest = {
    userId: user.userId,
  };

  await asyncClientCall(client, "setAsInitAdmin", request);

  await reloadEntities(em, [user]);

  expect(user.platformRoles).toIncludeSameMembers([PlatformRole.PLATFORM_ADMIN]);
  expect(user.tenantRoles).toIncludeSameMembers([TenantRole.TENANT_ADMIN]);
});

it("unsets an user as platforn admin and tenant admin", async () => {

  // create an user
  const em = server.ext.orm.em.fork();
  const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

  const user = new User({
    email: "test@test.com", name: "123", tenant: toRef(tenant), userId: "123",
    platformRoles: [PlatformRole.PLATFORM_ADMIN],
    tenantRoles: [TenantRole.TENANT_ADMIN],
  });

  await em.persistAndFlush(user);

  const request: UnsetInitAdminRequest = {
    userId: user.userId,
  };

  await asyncClientCall(client, "unsetInitAdmin", request);

  await reloadEntities(em, [user]);

  expect(user.platformRoles).not.toInclude(PlatformRole.PLATFORM_ADMIN);
  expect(user.tenantRoles).not.toInclude(TenantRole.TENANT_ADMIN);
});

