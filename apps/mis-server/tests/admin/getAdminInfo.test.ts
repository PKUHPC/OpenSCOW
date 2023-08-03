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
import { AdminServiceClient, GetAdminInfoResponse } from "@scow/protos/build/server/admin";
import { createServer } from "src/app";
import { Tenant } from "src/entities/Tenant";
import { PlatformRole, User } from "src/entities/User";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { insertInitialData } from "tests/data/data";
import { dropDatabase } from "tests/data/helpers";

let server: Server;
let em: SqlEntityManager;
let client: AdminServiceClient;

beforeEach(async () => {

  server = await createServer();
  await server.start();

  client = new AdminServiceClient(server.serverAddress, ChannelCredentials.createInsecure());
  em = server.ext.orm.em.fork();
  await insertInitialData(em);

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("get admin info", async () => {

  const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });
  const adminUser = new User({
    name: "admin", userId: "admin_user", email: "admin@admin.com", tenant,
    platformRoles: [PlatformRole.PLATFORM_ADMIN],
  });
  const financeUser = new User({
    name: "finance", userId: "finance_user", email: "finance@finance.com", tenant,
    platformRoles: [PlatformRole.PLATFORM_FINANCE],
  });
  await em.persistAndFlush(adminUser);
  await em.persistAndFlush(financeUser);

  const info = await asyncClientCall(client, "getAdminInfo", {});

  expect(info).toEqual({
    platformAdmins: [adminUser].map((x) => ({ userId: x.userId, userName: x.name })),
    platformFinancialStaff: [financeUser].map((x) => ({ userId: x.userId, userName: x.name })),
    tenantCount: 2,
    accountCount: 3,
    userCount: 5,
  } as GetAdminInfoResponse);

});
