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
import { OperationLogServiceClient, operationResultFromJSON } from "@scow/protos/build/audit/operation_log";
import { createServer } from "src/app";
import { OperationLog, OperationResult } from "src/entities/OperationLog";
import { dropDatabase } from "tests/utils/helpers";

let server: Server;
let client: OperationLogServiceClient;

const operationLog = {
  operatorUserId: "testUserId",
  operatorIp: "127.0.0.1",
  operationResult: OperationResult.SUCCESS,
  operationEvent: { "$case": "submitJob" as const, submitJob: { accountName: "testAccount", jobId: 123 } },
};


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

it("get operation logs", async () => {

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
      },
    },
  });
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
        },
      },
    },
  ]);
});
