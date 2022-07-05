import mkdirRoute from "src/pages/api/file/mkdir";
import { sftpMkdir, sftpStat } from "src/utils/sftp";
import { actualPath, call, CLUSTER,
  connectToTestServer, createTestItems, resetTestServer, TestServer } from "tests/file/utils";

let server: TestServer;

beforeEach(async () => {
  server = await connectToTestServer();
  await createTestItems(server);
});

afterEach(async () => {
  await resetTestServer(server);
});

it("creates dir", async () => {

  const folderName = "newfolder";
  const path = actualPath(folderName);

  const { res } = await call(mkdirRoute, {
    body: { cluster: CLUSTER, path },
  });

  expect(res.statusCode).toBe(204);

  expect((await sftpStat(server.sftp)(path)).isDirectory()).toBeTrue();
});

it("returns 409 if exists", async () => {
  const folderName = "newfile";
  const folderPath = actualPath(folderName);

  await sftpMkdir(server.sftp)(folderPath);

  const { res } = await call(mkdirRoute, {
    body: { cluster: CLUSTER, path: folderPath },
  });

  expect(res.statusCode).toBe(409);
});

