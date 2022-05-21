import { FastifyInstance } from "fastify";
import fs from "fs";
import { join } from "path";
import { buildApp } from "src/app";
import { TOKEN_COOKIE_HEADER } from "src/config/env";
import { actualPath, createFile, createTestItems, removeGracefulShutdown,
  removeTestItems, TOKEN } from "tests/utils";

let server: FastifyInstance;
const fileName = "testfile";

beforeEach(async () => {
  await createTestItems();
  server = buildApp();

  await server.ready();

  await fs.promises.open(actualPath(fileName), "w");

});

afterEach(async () => {
  await server.close();

  removeGracefulShutdown();

  await removeTestItems();
});

it("copies file", async () => {
  const newFileName = "newFile";

  const rep = await server.inject({
    method: "PUT",
    path: "/item",
    payload: { from: actualPath(fileName), to: actualPath(newFileName) },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(204);

  expect(fs.existsSync(actualPath(fileName))).toBeTrue();
  expect(fs.existsSync(actualPath(newFileName))).toBeTrue();
});

it("copies directory", async () => {
  const sourceFolder = "newFolder";
  const containingFile = "testfile";
  const targetFolder = "targetFolder";

  await fs.promises.mkdir(actualPath(sourceFolder));
  await createFile(actualPath(join(sourceFolder, containingFile)));

  const rep = await server.inject({
    method: "PUT",
    path: "/item",
    payload: { from: actualPath(sourceFolder), to: actualPath(targetFolder) },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(204);

  expect(fs.existsSync(actualPath(sourceFolder))).toBeTrue();
  expect(fs.existsSync(actualPath(targetFolder))).toBeTrue();
  expect(fs.existsSync(actualPath(join(targetFolder, containingFile)))).toBeTrue();
});
