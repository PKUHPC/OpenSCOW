import { asyncDuplexStreamCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { credentials } from "@grpc/grpc-js";
import { createServer } from "src/app";
import { ShellServiceClient } from "src/generated/portal/shell";
import { cluster, connectToTestServer,
  createTestItems, resetTestServer, TestSshServer, userId } from "tests/file/utils";

let ssh: TestSshServer;
let server: Server;
let client: ShellServiceClient;

beforeEach(async () => {
  ssh = await connectToTestServer();
  await createTestItems(ssh);

  server = await createServer();
  await server.start();

  client = new ShellServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await resetTestServer(ssh);
  await server.close();
});

it("tests shell interaction", async () => {
  const stream = asyncDuplexStreamCall(client, "shell");

  await stream.writeAsync({ message: { $case: "connect", connect: { cluster, userId } } });

  // get rid of greeting
  await stream.readAsync();
  await stream.readAsync();

  // the shell echoes back input
  const type = "123";
  await stream.writeAsync({ message: { $case: "data", data: { data: Buffer.from(type) } } });

  const data = await stream.readAsync();

  try {
    expect(data?.data.toString()).toBe(type);
  } finally {
    stream.end();
  }



});
