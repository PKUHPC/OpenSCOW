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
import { decimalToMoney } from "@scow/lib-decimal";
import { AccountServiceClient } from "@scow/protos/build/server/account";
import { createServer } from "src/app";
import { InitialData, insertInitialData } from "tests/data/data";
import { dropDatabase } from "tests/data/helpers";


let server: Server;
let data: InitialData;

beforeEach(async () => {

  server = await createServer();

  const em = server.ext.orm.em.fork();

  data = await insertInitialData(em);

  await server.start();

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("gets all accounts", async () => {
  const client = new AccountServiceClient(server.serverAddress, ChannelCredentials.createInsecure());

  const resp = await asyncClientCall(client, "getAccounts", {
    tenantName: data.tenant.name,
  });

  expect(resp.results).toIncludeSameMembers([
    {
      "accountName": "hpca",
      "blocked": false,
      "ownerId": "a",
      "ownerName": "AName",
      "userCount": 2,
      "comment": "",
      "tenantName": data.tenant.name,
      balance: decimalToMoney(data.accountA.balance),
    },
    { "accountName": "hpcb",
      "blocked": false,
      "ownerId": "b",
      "ownerName": "BName",
      "userCount": 1,
      "tenantName": data.tenant.name,
      comment: "",
      balance: decimalToMoney(data.accountB.balance),
    },
  ]);

});
