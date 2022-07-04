import uploadRoute from "src/pages/api/file/upload";
import { sftpStat } from "src/utils/sftp";
import { actualPath, call, CLUSTER, connectToTestServer, createTestItems,
  mockFileForm, resetTestServer, TestServer } from "tests/file/utils";

let server: TestServer;

beforeEach(async () => {
  server = await connectToTestServer();
  await createTestItems(server);
});

afterEach(async () => {
  await resetTestServer(server);
});

// node-mocks-http doesn't support req.pipe
it.skip("uploads file", async () => {

  const fileName = "newfile";

  const filePath = actualPath(fileName);

  const size = 10000;

  const formData = mockFileForm(size, "test.pdf");

  const { res } = await call(uploadRoute, {
    query: { cluster: CLUSTER, path: filePath },
    body: formData,
    headers: formData.getHeaders(),
  });

  expect(res.statusCode).toBe(201);

  const stat = await sftpStat(server.sftp)(filePath);
  expect(stat.size).toBe(size);
  expect(stat.uid).toBe(1000);
});

it.skip("returns 500 if written to path without permission", async () => {

  const filePath = "/test";

  const size = 10000;

  const formData = mockFileForm(size, "test.pdf");

  const { res } = await call(uploadRoute, {
    query: { cluster: CLUSTER, path: filePath },
    body: formData,
    headers: formData.getHeaders(),
  });

  expect(res.statusCode).toBe(500);
});

