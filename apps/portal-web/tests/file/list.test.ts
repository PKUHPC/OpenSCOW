import listRoute, { ListFileSchema } from "src/pages/api/file/list";
import { actualPath, call, CLUSTER, connectToTestServer,
  createTestItems, resetTestServer, TestServer  } from "tests/file/utils";

let server: TestServer;

beforeEach(async () => {
  server = await connectToTestServer();
  await createTestItems(server);
});

afterEach(async () => {
  await resetTestServer(server);
});


it("gets file list", async () => {

  const { res } = await call(listRoute, {
    query: { cluster: CLUSTER, path: actualPath("") },
  });

  expect(res.statusCode).toBe(200);

  const data = res._getJSONData();

  expect(data.items).toIncludeSameMembers([
    { name: "dir1", type: "dir", mode: expect.any(Number), mtime: expect.any(String), size: expect.any(Number) },
    { name: "test1", type: "file", mode: expect.any(Number), mtime: expect.any(String), size: expect.any(Number) },
  ] as ListFileSchema["responses"]["200"]["items"][number][]);

});

it("returns 412 if list a file", async () => {
  const { res } = await call(listRoute, {
    query: { cluster: CLUSTER, path: actualPath("test1") },
  });

  expect(res.statusCode).toBe(412);
});

it("returns 403 if list non-existent folder", async () => {
  const { res } = await call(listRoute, {
    query: { cluster: CLUSTER, path: actualPath("folder") },
  });
  expect(res.statusCode).toBe(403);
});


