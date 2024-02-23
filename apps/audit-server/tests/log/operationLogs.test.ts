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

import { asyncClientCall, asyncReplyStreamCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials } from "@grpc/grpc-js";
import {
  ExportOperationLogResponse,
  OperationLog as OperationLogProto,
  OperationLogServiceClient,
  operationResultFromJSON,
} from "@scow/protos/build/audit/operation_log";
import { createServer } from "src/app";
import { OperationLog, OperationResult } from "src/entities/OperationLog";
import { dropDatabase } from "tests/utils/helpers";

let server: Server;
let client: OperationLogServiceClient;

const operationLog = {
  operatorUserId: "testUserId",
  operatorIp: "127.0.0.1",
  operationResult: OperationResult.SUCCESS,
  operationEvent: { "$case": "submitJob" as const, submitJob: {
    accountName: "testAccount",
    jobId: 123,
    clusterId: "test" } },
};

const operationLog1 = new OperationLog({
  operationLogId: 1,
  operatorUserId: operationLog.operatorUserId,
  operatorIp: operationLog.operatorIp,
  operationResult: operationLog.operationResult,
  operationTime: new Date("2023-08-14T10:45:02.000Z"),
  metaData: operationLog.operationEvent,
});

const operationLog2 = new OperationLog({
  operationLogId: 2,
  operatorUserId: operationLog.operatorUserId,
  operatorIp: operationLog.operatorIp,
  operationResult: operationLog.operationResult,
  operationTime: new Date("2023-08-14T10:45:02.000Z"),
  metaData: {
    $case: "endJob", endJob: {
      jobId:123,
      clusterId: "test",
    },
  },
});

const operationLog3 = new OperationLog({
  operationLogId: 3,
  operatorUserId: operationLog.operatorUserId,
  operatorIp: operationLog.operatorIp,
  operationResult: operationLog.operationResult,
  operationTime: new Date("2023-12-05T02:14:54.165Z"),
  metaData: {
    $case: "exportOperationLog",
    exportOperationLog: {
      source: { $case: "account", account: { "accountName": "test_account" } },
    },
    targetAccountName: "test_account",
  },
});

const operationLog4 = new OperationLog({
  operationLogId: 4,
  operatorUserId: operationLog.operatorUserId,
  operatorIp: operationLog.operatorIp,
  operationResult: operationLog.operationResult,
  operationTime: new Date("2023-12-05T02:15:02.648Z"),
  metaData: {
    $case: "exportOperationLog",
    exportOperationLog: {
      source: { $case: "admin", admin: {} },
    },
  },
});

async function collectOperationLog(stream: AsyncIterable<ExportOperationLogResponse>) {

  const operationLogs: OperationLogProto[] = [];

  for await (const res of stream) {
    const a = res.operationLogs;
    a.forEach((o) => {
      operationLogs.push(o);
    });
  }

  return operationLogs;
}

beforeEach(async () => {
  server = await createServer();
  await server.start();
  client = new OperationLogServiceClient(server.serverAddress, ChannelCredentials.createInsecure());
});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("create operation log", async () => {

  const em = server.ext.orm.em.fork();

  await asyncClientCall(client, "createOperationLog", {
    ...operationLog,
    operationResult: operationResultFromJSON(operationLog.operationResult),
  });

  const operationLogs = await em.find(OperationLog, { operatorUserId: operationLog.operatorUserId }, {
    orderBy: { operationTime: "DESC" },
    limit: 1,
  });

  expect(operationLogs[0].operatorUserId).toEqual(operationLog.operatorUserId);
  expect(operationLogs[0].operatorIp).toEqual(operationLog.operatorIp);
  expect(operationLogs[0].operationResult).toEqual(operationLog.operationResult);
  expect(operationLogs[0].metaData?.$case).toEqual(operationLog.operationEvent.$case);
  expect(operationLogs[0].metaData?.[operationLogs[0].metaData?.$case]).toEqual(operationLog.operationEvent.submitJob);
  expect(operationLogs[0].metaData?.targetAccountName).toEqual(operationLog.operationEvent.submitJob.accountName);
});

it("create operation log with targetAccountName", async () => {

  const em = server.ext.orm.em.fork();

  const exportChargeRecordLog = {
    operatorUserId: "testUserId",
    operatorIp: "127.0.0.1",
    operationResult: operationResultFromJSON(OperationResult.SUCCESS),
    operationEvent: {
      $case: "exportChargeRecord" as const,
      exportChargeRecord: { target:{
        $case: "accountOfTenant" as const,
        accountOfTenant: {
          accountName: "testAccount",
          tenantName: "testTenant",
        },
      },
      },
    },
  };

  const exportPayRecordLog = {
    operatorUserId: "testUserId",
    operatorIp: "127.0.0.1",
    operationResult: operationResultFromJSON(OperationResult.SUCCESS),
    operationEvent: {
      $case: "exportPayRecord" as const,
      exportPayRecord: { target:{
        $case: "accountOfTenant" as const,
        accountOfTenant: {
          accountName: "testAccount",
          tenantName: "testTenant",
        },
      },
      },
    },
  };

  const exportOperationLog = {
    operatorUserId: "testUserId",
    operatorIp: "127.0.0.1",
    operationResult: operationResultFromJSON(OperationResult.SUCCESS),
    operationEvent: {
      $case: "exportOperationLog" as const,
      exportOperationLog: { source:{
        $case: "account" as const,
        account: {
          accountName: "testAccount",
        },
      },
      },
    },
  };
  await asyncClientCall(client, "createOperationLog", {
    ...exportChargeRecordLog,
  });
  await asyncClientCall(client, "createOperationLog", {
    ...exportPayRecordLog,
  });
  await asyncClientCall(client, "createOperationLog", {
    ...exportOperationLog,
  });

  const operationLogs = await em.find(OperationLog, { operatorUserId: operationLog.operatorUserId }, {
    orderBy: { operationTime: "DESC" },
    limit: 3,
  });

  expect(operationLogs[0].metaData?.$case).toEqual("exportOperationLog");
  expect(operationLogs[0].metaData?.[operationLogs[0].metaData?.$case])
    .toEqual(exportOperationLog.operationEvent.exportOperationLog);
  expect(operationLogs[0].metaData?.targetAccountName)
    .toEqual(exportOperationLog.operationEvent.exportOperationLog.source.account.accountName);

  expect(operationLogs[1].metaData?.$case).toEqual("exportPayRecord");
  expect(operationLogs[1].metaData?.[operationLogs[1].metaData?.$case])
    .toEqual(exportPayRecordLog.operationEvent.exportPayRecord);
  expect(operationLogs[1].metaData?.targetAccountName)
    .toEqual(exportPayRecordLog.operationEvent.exportPayRecord.target.accountOfTenant.accountName);

  expect(operationLogs[2].metaData?.$case).toEqual("exportChargeRecord");
  expect(operationLogs[2].metaData?.[operationLogs[2].metaData?.$case])
    .toEqual(exportChargeRecordLog.operationEvent.exportChargeRecord);
  expect(operationLogs[2].metaData?.targetAccountName)
    .toEqual(exportChargeRecordLog.operationEvent.exportChargeRecord.target.accountOfTenant.accountName);
});

it("get operation logs", async () => {

  const em = server.ext.orm.em.fork();
  await em.persistAndFlush([operationLog1, operationLog2]);

  const resp = await asyncClientCall(client, "getOperationLogs", {
    page: 1,
    filter: { operatorUserIds: ["testUserId"], operationDetail: "123" },
  });

  expect(resp.totalCount).toBe(2);


  expect(resp.results).toIncludeSameMembers([
    {
      operationLogId: 1,
      operatorUserId: operationLog.operatorUserId,
      operatorIp: operationLog.operatorIp,
      operationResult: operationResultFromJSON(operationLog.operationResult),
      operationTime: "2023-08-14T10:45:02.000Z",
      operationEvent: operationLog.operationEvent,
    },
    {
      operationLogId: 2,
      operatorUserId: operationLog.operatorUserId,
      operatorIp: operationLog.operatorIp,
      operationResult:  operationResultFromJSON(operationLog.operationResult),
      operationTime: "2023-08-14T10:45:02.000Z",
      operationEvent: {
        $case: "endJob", endJob: {
          jobId:123,
          clusterId: "test",
        },
      },
    },
  ]);
});


it("export operation logs", async () => {

  const em = server.ext.orm.em.fork();
  await em.persistAndFlush([operationLog3, operationLog4]);

  const stream = asyncReplyStreamCall(client, "exportOperationLog", {
    count: 2,
    filter: { operatorUserIds: ["testUserId"]},
  });

  const exportOperationLogs = await collectOperationLog(stream);

  expect(exportOperationLogs).toMatchObject([
    {
      operationLogId: 4,
      operatorUserId: operationLog4.operatorUserId,
      operatorIp: operationLog4.operatorIp,
      operationResult:  operationResultFromJSON(operationLog4.operationResult),
      operationTime: operationLog4.operationTime?.toISOString(),
      operationEvent: operationLog4.metaData,
    },
    {
      operationLogId: 3,
      operatorUserId: operationLog3.operatorUserId,
      operatorIp: operationLog3.operatorIp,
      operationResult: operationResultFromJSON(operationLog3.operationResult),
      operationTime: operationLog3.operationTime?.toISOString(),
      operationEvent: {
        $case: "exportOperationLog",
        exportOperationLog: {
          source: { $case: "account", account: { "accountName": "test_account" } },
        },
      },
    },
  ]);
});
