import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { credentials, status } from "@grpc/grpc-js";
import { createServer } from "src/app";
import { FileInfo, FileInfo_FileType, FileServiceClient } from "src/generated/portal/file";
import { actualPath, cluster, connectToTestServer,
  createTestItems, expectGrpcThrow, resetTestServer, TestSshServer, userId } from "tests/file/utils";

let ssh: TestSshServer;
let server: Server;
let client: FileServiceClient;

beforeEach(async () => {
  ssh = await connectToTestServer();
  await createTestItems(ssh);

  server = await createServer();
  await server.start();

  client = new FileServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await resetTestServer(ssh);
  await server.close();
});

it("gets file list", async () => {

  const reply = await asyncUnaryCall(client, "readDirectory", {
    cluster, userId, path: actualPath(""),
  });

  expect(reply.results).toIncludeSameMembers([
    { name: "dir1", type: FileInfo_FileType.Dir,
      mode: expect.any(Number), mtime: expect.any(String), size: expect.any(Number) },
    { name: "test1", type: FileInfo_FileType.File,
      mode: expect.any(Number), mtime: expect.any(String), size: expect.any(Number) },
  ] as FileInfo[]);

});

it("returns error if list a file", async () => {

  await expectGrpcThrow(asyncUnaryCall(client, "readDirectory", {
    cluster, userId, path: actualPath("test1"),
  }), (e) => {
    expect(e.code).toBe(status.INVALID_ARGUMENT);
  });
});

it("returns 403 if list non-existent folder", async () => {

  await expectGrpcThrow(asyncUnaryCall(client, "readDirectory", {
    cluster, userId, path: actualPath("folder"),
  }), (e) => {
    expect(e.code).toBe(status.PERMISSION_DENIED);
  });
});


