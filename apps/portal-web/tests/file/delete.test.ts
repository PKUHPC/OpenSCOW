import path from "path";
import deleteDirRoute from "src/pages/api/file/deleteDir";
import deleteFileRoute from "src/pages/api/file/deleteFile";
import { sftpExists, sftpMkdir } from "src/utils/sftp";
import { actualPath, call, CLUSTER, connectToTestServer, createFile,
  createTestItems, resetTestServer, TestServer } from "tests/file/utils";

let server: TestServer;

beforeEach(async () => {
  server = await connectToTestServer();
  await createTestItems(server);
});

afterEach(async () => {
  await resetTestServer(server);
});

it("deletes file", async () => {

  const fileName = "testfile";

  await createFile(server.sftp, actualPath(fileName));

  const { res } = await call(deleteFileRoute, {
    body: {
      cluster: CLUSTER,
      path: actualPath(fileName),
    },
  });
  expect(res.statusCode).toBe(204);

  expect(await sftpExists(server.sftp, actualPath(fileName))).toBeFalse();

});

it("deletes folder", async () => {
  const fileName = "testfile";
  const folderName = "folder" + process.env.JEST_WORKER_ID;

  const folderFullPath = actualPath(folderName);

  await sftpMkdir(server.sftp)(folderFullPath);
  await createFile(server.sftp, actualPath(path.join(folderName, fileName)));

  const { res } = await call(deleteDirRoute, {
    body: {
      cluster: CLUSTER,
      path: folderFullPath,
    },
  });
  expect(res.statusCode).toBe(204);

  expect(await sftpExists(server.sftp, folderFullPath)).toBeFalse();
});

it("204 if deleting non-existence folder", async () => {

  const { res } = await call(deleteDirRoute, {
    body: {
      cluster: CLUSTER,
      path: actualPath("non-exists"),
    },
  });

  expect(res.statusCode).toBe(204);
});
