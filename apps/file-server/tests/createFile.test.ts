import { FastifyInstance } from "fastify";
import fs from "fs";
import { buildApp } from "src/app";
import { TOKEN_COOKIE_HEADER } from "src/config";
import { actualPath, createFile, createTestItems,
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

it("creates file", async () => {

  const fileName = "newfile";

  const rep = await server.inject({
    method: "POST",
    path: "/file",
    payload: { path: actualPath(fileName) },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(204);

  expect((await fs.promises.stat(actualPath(fileName))).isFile()).toBeTrue();
});

it("returns 409 if exists", async () => {
  const fileName = "newfile";
  const filePath = actualPath(fileName);

  await createFile(filePath);

  expect((await fs.promises.stat(filePath)).isFile()).toBeTrue();

  const rep = await server.inject({
    method: "POST",
    path: "/file",
    payload: { path: filePath },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(409);

  expect((await fs.promises.stat(filePath)).isFile()).toBeTrue();
});

