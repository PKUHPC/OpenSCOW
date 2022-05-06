import { FastifyInstance } from "fastify";
import fs from "fs";
import { buildApp } from "src/app";
import { TOKEN_COOKIE_HEADER } from "src/config";
import { actualPath, createTestItems,
  removeGracefulShutdown, removeTestItems, TOKEN } from "tests/utils";

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



it("creates dir", async () => {

  const folderName = "newfolder";

  const rep = await server.inject({
    method: "POST",
    path: "/dir",
    payload: { path: actualPath(folderName) },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(204);

  expect((await fs.promises.stat(actualPath(folderName))).isDirectory()).toBeTrue();
});

it("returns 409 if exists", async () => {
  const folderName = "newfile";
  const folderPath = actualPath(folderName);

  await fs.promises.mkdir(folderPath, { recursive: true });

  expect((await fs.promises.stat(actualPath(folderName))).isDirectory()).toBeTrue();

  const rep = await server.inject({
    method: "POST",
    path: "/dir",
    payload: { path: folderPath },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(409);

  expect((await fs.promises.stat(actualPath(folderName))).isDirectory()).toBeTrue();
});

