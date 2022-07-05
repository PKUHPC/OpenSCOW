import { join } from "path";
import copyFileRoute from "src/pages/api/file/copy";
import { sftpExists, sftpMkdir } from "src/utils/sftp";

import { actualPath, call, CLUSTER, connectToTestServer, createFile, createTestItems,
  resetTestServer, TestServer } from "./utils";

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

it("copies file", async () => {

  const newFileName = "newFile";

  const { res } = await call(copyFileRoute, { body: {
    cluster: CLUSTER,
    fromPath: actualPath(fileName),
    toPath: actualPath(newFileName),
  } });

  expect(res.statusCode).toBe(204);

  expect(await sftpExists(server.sftp, actualPath(fileName))).toBeTrue();
  expect(await sftpExists(server.sftp, actualPath(newFileName))).toBeTrue();
});

it("copies directory", async () => {
  const sourceFolder = "newFolder";
  const containingFile = "testfile";
  const targetFolder = "targetFolder";

  await sftpMkdir(server.sftp)(actualPath(sourceFolder));
  await createFile(server.sftp, actualPath(join(sourceFolder, containingFile)));

  const { res } = await call(copyFileRoute, { body: {
    cluster: CLUSTER,
    fromPath: actualPath(sourceFolder),
    toPath: actualPath(targetFolder),
  } });

  expect(res.statusCode).toBe(204);

  expect(await sftpExists(server.sftp, actualPath(sourceFolder))).toBeTrue();
  expect(await sftpExists(server.sftp, actualPath(targetFolder))).toBeTrue();
  expect(await sftpExists(server.sftp, actualPath(join(targetFolder, containingFile)))).toBeTrue();
});
