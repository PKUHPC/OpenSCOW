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
import { AdminServiceClient } from "@scow/protos/build/server/admin";
import { createServer } from "src/app";
import { SystemState } from "src/entities/SystemState";
import { dropDatabase } from "tests/data/helpers";


let server: Server;

beforeEach(async () => {

  server = await createServer();

  await server.start();
});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("test whether the block update time exists, and update it if exits", async () => {
  const client = new AdminServiceClient(server.serverAddress, ChannelCredentials.createInsecure());


  const em = server.ext.orm.em.fork();
  const updateTime = await em.findOneOrFail(SystemState, { key: SystemState.KEYS.UPDATE_SLURM_BLOCK_STATUS });
  expect(updateTime !== null).toBeTrue();

  await asyncClientCall(client, "updateBlockStatus", {});

  const curUpdateTime = await em.findOneOrFail(SystemState, { key: SystemState.KEYS.UPDATE_SLURM_BLOCK_STATUS });
  expect(updateTime !== curUpdateTime).toBeTrue();

});

