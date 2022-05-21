import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { buildApp } from "src/app";
import { TOKEN_COOKIE_HEADER } from "src/config/env";
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



it("deletes file", async () => {

  const fileName = "testfile";

  await createFile(actualPath(fileName));

  const rep = await server.inject({
    method: "DELETE",
    path: "/item",
    query: { path: actualPath(fileName) },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(204);

  expect(fs.existsSync(actualPath(fileName))).toBeFalse();
});

it("deletes folder", async () => {
  const fileName = "testfile";
  const folderName = "folder" + process.env.JEST_WORKER_ID;

  const folderFullPath = actualPath(folderName);

  await fs.promises.mkdir(folderFullPath, { recursive: true });
  await (await fs.promises.open(actualPath(path.join(folderName, fileName)), "w")).close();

  const rep = await server.inject({
    method: "DELETE",
    path: "/item",
    query: { path: actualPath(folderName) },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(204);

  expect(fs.existsSync(folderFullPath)).toBeFalse();
});

it("403 if deleting non-existence folder", async () => {

  const rep = await server.inject({
    method: "DELETE",
    path: "/item",
    query: { path: actualPath("non-existence") },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(403);
});
