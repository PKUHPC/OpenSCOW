import { sftpExists } from "@scow/lib-ssh";
import createFileRoute from "src/pages/api/file/createFile";
import { actualPath, call, CLUSTER, connectToTestServer,
  createFile, createTestItems, resetTestServer, TestServer } from "tests/file/utils";

let server: TestServer;

beforeEach(async () => {
  server = await connectToTestServer();
  await createTestItems(server);
});

afterEach(async () => {
  await resetTestServer(server);
});

it("creates file", async () => {

  const fileName = "newfile";

  const { res } = await call(createFileRoute, {
    body: {
      cluster: CLUSTER,
      path: actualPath(fileName),
    },
  });

  expect(res.statusCode).toBe(204);

  expect(await sftpExists(server.sftp, actualPath(fileName))).toBeTrue();
});

it("returns 409 if exists", async () => {
  const fileName = "newfile";
  const filePath = actualPath(fileName);

  await createFile(server.sftp, filePath);

  const { res } = await call(createFileRoute, {
    body: {
      cluster: CLUSTER,
      path: actualPath(fileName),
    },
  });

  expect(res.statusCode).toBe(409);

  expect(await sftpExists(server.sftp, actualPath(fileName))).toBeTrue();
});

