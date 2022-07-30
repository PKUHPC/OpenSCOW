import { sftpReadFile } from "@scow/lib-ssh";
import getFileRoute from "src/pages/api/file/download";
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

it("gets file content", async () => {

  const path = actualPath("test1");

  const { res } = await call(getFileRoute, {
    query: {
      cluster: CLUSTER,
      path,
    },
  });

  expect(res.statusCode).toBe(200);
  expect(res._getBuffer()).toEqual(await sftpReadFile(server.sftp)(path));
});

it("can get dotfiles", async () => {

  const path = actualPath(".test1");

  await createFile(server.sftp, path);

  const { res } = await call(getFileRoute, {
    query: { cluster: CLUSTER, path },
  });

  expect(res.statusCode).toBe(200);
  expect(res._getBuffer()).toEqual(await sftpReadFile(server.sftp)(path));
});

it("has a reply headers with Content-Disposition: inline if download is false", async () => {
  const name = "test-download-false";
  const path = actualPath(name);

  await createFile(server.sftp, path);

  const { res } = await call(getFileRoute, {
    query: { cluster: CLUSTER, path },
  });

  expect(res.statusCode).toBe(200);
  expect(res.getHeader("Content-Disposition")).toBe(`inline; filename* = UTF-8''${name}`);
  expect(res._getBuffer()).toEqual(await sftpReadFile(server.sftp)(path));
});

it("returns 500 if /getFile a folder", async () => {
  const { res } = await call(getFileRoute, {
    query: { cluster: CLUSTER, path: actualPath("dir1") },
  });

  expect(res.statusCode).toBe(500);
});

it("returns 500 if /getFile non-existent file", async () => {
  const { res } = await call(getFileRoute, {
    query: { cluster: CLUSTER, path: actualPath("file") },
  });

  expect(res.statusCode).toBe(500);
});
