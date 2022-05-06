import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { buildApp } from "src/app";
import { TOKEN_COOKIE_HEADER } from "src/config";
import { actualPath,createTestItems, removeGracefulShutdown, removeTestItems } from "tests/utils";

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

it("rejects request if no cookie or cookie is not valid", async () => {
  let rep = await server.inject({
    path: "/dir",
    query: { path: actualPath("/") },
  });

  expect(rep.statusCode).toBe(401);

  rep = await server.inject({
    path: "/dir",
    query: { path: actualPath("/") },
    cookies: { [TOKEN_COOKIE_HEADER]: randomUUID() },
  });

  expect(rep.statusCode).toBe(403);

});
