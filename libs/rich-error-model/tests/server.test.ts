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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials, ServiceError, status } from "@grpc/grpc-js";
import { HookServiceClient, HookServiceServer, HookServiceService } from "@scow/protos/build/hook/hook";

import { DetailedError, ErrorInfo, LocalizedMessage, parseErrorDetails } from "../src";

let server: Server;

const errorMessage = "The expected error message";

const errorInfo = () => ErrorInfo.create({ domain: "test.com", reason: "123", metadata: { test1: "test" } });
const localizedMessage = () => LocalizedMessage.create({ locale: "zh-CN", message: "123" });

function createServer() {
  const server = new Server({
    host: "localhost", port: 0,
  });

  server.addService<HookServiceServer>(HookServiceService, {
    onEvent: async ({ request }) => {

      if (request.event?.$case === "userAdded") {
        throw new DetailedError({
          code: status.ALREADY_EXISTS,
          message: errorMessage,
          details: [errorInfo(), localizedMessage()],
        });
      }
      if (request.event?.$case === "accountBlocked") {
        throw new Error("Normal error");
      }

      return [{}];
    },
  });

  return server;
}

beforeEach(async () => {
  server = createServer();

  await server.start();
});

afterEach(async () => {
  await server.close();
});

const createClient = () => new HookServiceClient("127.0.0.1:" + server.port, ChannelCredentials.createInsecure());

it("throws and catches ErrorDetails", async () => {

  try {

    await asyncUnaryCall(createClient(), "onEvent", {
      metadata: { time: new Date().toISOString() },
      event: { $case: "userAdded", userAdded: { tenantName: "123", userId: "123" } },
    });

    expect("").fail("should not pass");
  } catch (e) {

    const ex = e as ServiceError;

    const errors = parseErrorDetails(ex.metadata);
    expect(ex.details).toBe(errorMessage);

    expect(errors).toIncludeAllMembers([
      errorInfo(), localizedMessage(),
    ]);
  }
});

it("does not interfere with normal error", async () => {
  try {

    await asyncUnaryCall(createClient(), "onEvent", {
      metadata: { time: new Date().toISOString() },
      event: { $case: "accountBlocked", accountBlocked: { accountName: "123", tenantName: "123" } },
    });

    expect("").fail("should not pass");
  }
  catch (e) {
    const ex = e as ServiceError;
    expect(ex.details).toBe("Normal error");
    const errors = parseErrorDetails(ex.metadata);
    expect(errors).toHaveLength(0);
  }
});


