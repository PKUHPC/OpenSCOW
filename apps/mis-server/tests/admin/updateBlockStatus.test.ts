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
import { AccountServiceClient } from "@scow/protos/build/server/account";
import { createServer } from "src/app";
import { updateBlockStatusInSlurm } from "src/bl/block";
import { SystemState } from "src/entities/SystemState";
import { BlockedData, insertBlockedData } from "tests/data/data";
import { dropDatabase } from "tests/data/helpers";

let server: Server;
let data: BlockedData;

beforeEach(async () => {

  server = await createServer();

  const em = server.ext.orm.em.fork();

  data = await insertBlockedData(em);

  await server.start();
});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("test whether the block update time exists at startup", async () => {
  const em = server.ext.orm.em.fork();
  const updateTime = await em.findOne(SystemState, { key: SystemState.KEYS.UPDATE_SLURM_BLOCK_STATUS });
  expect(updateTime).not.toBeNull();
});

it("update block status", async () => {
  const blockedData = await updateBlockStatusInSlurm(
    server.ext.orm.em.fork(), server.ext.clusters, server.logger);

  expect(blockedData.blockedAccounts).toEqual([data.blockedAccountB.id]);
  expect(blockedData.blockedUserAccounts).toEqual([data.uaAA.id]);
});

it("update block status with whitelist accounts", async () => {
  const client = new AccountServiceClient(server.serverAddress, ChannelCredentials.createInsecure());
  await asyncClientCall(client, "whitelistAccount", {
    tenantName: data.tenant.name,
    accountName: data.blockedAccountB.accountName,
    comment: "test",
    operatorId: "123",
  });

  const blockedData = await updateBlockStatusInSlurm(
    server.ext.orm.em.fork(), server.ext.clusters, server.logger);

  expect(blockedData.blockedAccounts).not.toContain([data.blockedAccountB.id]);
});







