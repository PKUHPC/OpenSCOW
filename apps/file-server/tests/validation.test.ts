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




it("checks if path is valid", async () => {

  const tests = [
    ["/ok", true],
    ["/ok ok", true],
    ["/ok ok/ok /", true],
    ["/ok ' \" /", true],
    ["not ok", false],
    ["/not ok\n", false],
  ] as const;

  await Promise.all(tests.map(async ([path, expected]) => {

    const rep = await server.inject({
      path: "/dir",
      query: { path: path },
      cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
    });

    if ((rep.statusCode !== 400) !== expected) {
      fail(`Check ${path} failed. Expected ${expected}`);
    }
  }));

});

it("allows for file paths with quotes and spaces", async () => {
  const tests = [
    "\"",
    "  a ",
    "'\"",
    " '\" 'a ",
    " '\" && exit 1",
    " ",
  ];

  await Promise.all(tests.map(async (path) => {

    // create the file
    const fullPath = actualPath(path);
    await fs.promises.mkdir(fullPath);

    const rep = await server.inject({
      path: "/dir",
      query: { path: fullPath },
      cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
    });

    if (rep.statusCode !== 200) {
      fail(`Check ${fullPath} failed. ${rep}`);
    }
  }));

});
