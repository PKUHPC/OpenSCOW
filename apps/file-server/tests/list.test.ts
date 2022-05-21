import { FastifyInstance } from "fastify";
import { buildApp } from "src/app";
import { TOKEN_COOKIE_HEADER } from "src/config/env";
import { Responses } from "src/routes/list";
import { actualPath, createTestItems, removeGracefulShutdown, removeTestItems, TOKEN } from "tests/utils";

let server: FastifyInstance;


beforeEach(async () => {
  await createTestItems();

  server = buildApp();

  await server.ready();


});

afterEach(async () => {
  await server.close();

  removeGracefulShutdown();
  await removeTestItems();

});



it("gets file list", async () => {
  const rep = await server.inject({
    path: "/dir",
    query: { path: actualPath("") },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(200);

  const data = rep.json<Responses["200"]>();

  expect(data.items).toIncludeSameMembers([
    { name: "dir1", type: "dir", mode: expect.any(Number), mtime: expect.any(String), size: expect.any(Number) },
    { name: "test1", type: "file", mode: expect.any(Number), mtime: expect.any(String), size: expect.any(Number) },
  ] as Responses["200"]["items"][number][]);

});

it("returns 412 if list a file", async () => {
  const rep = await server.inject({
    path: "/dir",
    query: { path: actualPath("test1") },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(412);
});

it("returns 403 if list non-existent folder", async () => {
  const rep = await server.inject({
    path: "/dir",
    query: { path: actualPath("folder") },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(403);
});


