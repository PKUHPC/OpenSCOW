import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import { decimalToMoney } from "@scow/lib-decimal";
import { createServer } from "src/app";
import { AccountServiceClient } from "src/generated/server/account";
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
