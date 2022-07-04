import moveFileRoute from "src/pages/api/file/move";
import { sftpExists } from "src/utils/sftp";
import { actualPath, call, CLUSTER, connectToTestServer, createFile,
  createTestItems, resetTestServer, TestServer } from "tests/file/utils";

const fileName = "testfile";
let server: TestServer;

beforeEach(async () => {
  server = await connectToTestServer();
  await createTestItems(server);

  await createFile(server.sftp, actualPath(fileName));
});

afterEach(async () => {
  await resetTestServer(server);
});


it("moves file", async () => {
  const newFileName = "newFile";

  const { res } = await call(moveFileRoute, {
    body: { cluster: CLUSTER, fromPath: actualPath(fileName), toPath: actualPath(newFileName) },
  });

  expect(res.statusCode).toBe(204);

  expect(await sftpExists(server.sftp, actualPath(fileName))).toBeFalse();
  expect(await sftpExists(server.sftp, actualPath(newFileName))).toBeTrue();
});
