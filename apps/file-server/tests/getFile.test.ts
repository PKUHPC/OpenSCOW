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



it("gets file content", async () => {

  const path = actualPath("test1");

  const rep = await server.inject({
    path: "/file",
    query: { path },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(200);
  expect(rep.body).toBe(await fs.promises.readFile(path, "utf-8"));
});

it("can get dotfiles", async () => {

  const path = actualPath(".test1");

  await createFile(path);

  const rep = await server.inject({
    path: "/file",
    query: { path },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(200);
  expect(rep.body).toBe(await fs.promises.readFile(path, "utf-8"));
});

it("has a reply headers with Content-Disposition: inline if download is false", async () => {
  const name = "test-download-false";
  const path = actualPath(name);

  await createFile(path);

  const rep = await server.inject({
    path: "/file",
    query: { path, download: "false" },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.headers["Content-Disposition".toLowerCase()]).toBe(`inline; filename="${name}"`);
  expect(rep.statusCode).toBe(200);
  expect(rep.body).toBe(await fs.promises.readFile(path, "utf-8"));
});

it("correctly handles headers of filename with quotes", async () => {
  const name = "\"ta\"\"";
  const path = actualPath(name);

  await createFile(path);

  const rep = await server.inject({
    path: "/file",
    query: { path },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.headers["Content-Disposition".toLowerCase()]).toBe(`attachment; filename="${name.replace("\"", "\\\"")}"`);
  expect(rep.statusCode).toBe(200);
});

it("returns 412 if /getFile a folder", async () => {
  const rep = await server.inject({
    path: "/file",
    query: { path: actualPath("dir1") },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(412);
});

it("returns 403 if /getFile non-existent file", async () => {
  const rep = await server.inject({
    path: "/file",
    query: { path: actualPath("file") },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(403);
});
