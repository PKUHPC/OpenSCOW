import { FastifyInstance } from "fastify";
import fs from "fs";
import { buildApp } from "src/app";
import { TOKEN_COOKIE_HEADER } from "src/config";
import { actualPath, createTestItems, removeGracefulShutdown, removeTestItems, TOKEN } from "tests/utils";

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



it("moves file", async () => {
  const newFileName = "newFile";

  const rep = await server.inject({
    method: "PATCH",
    path: "/item",
    payload: { from: actualPath(fileName), to: actualPath(newFileName) },
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(204);

  expect(fs.existsSync(actualPath(fileName))).toBeFalse();
  expect(fs.existsSync(actualPath(newFileName))).toBeTrue();

  await fs.promises.rm(actualPath(newFileName));
});
