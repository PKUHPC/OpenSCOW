import { FastifyInstance } from "fastify";
import fs from "fs";
import { buildApp } from "src/app";
import { TOKEN_COOKIE_HEADER } from "src/config/env";
import { actualPath,  createTestItems, mockFileForm,
  removeGracefulShutdown, removeTestItems, TEST_USER_UID,TOKEN } from "tests/utils";

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



it("uploads file", async () => {

  const fileName = "newfile";

  const filePath = actualPath(fileName);

  const size = 10000;

  const formData = mockFileForm(size, "test.pdf");

  const rep = await server.inject({
    method: "POST",
    path: "/upload",
    query: { path: filePath },
    payload: formData,
    headers: formData.getHeaders(),
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(201);

  const stat = await fs.promises.stat(filePath);
  expect(stat.size).toBe(size);
  expect(stat.uid).toBe(TEST_USER_UID);
});

it("returns 409 if written to path without permission", async () => {

  const filePath = "/test";

  const size = 10000;

  const formData = mockFileForm(size, "test.pdf");

  const rep = await server.inject({
    method: "POST",
    path: "/upload",
    query: { path: filePath },
    payload: formData,
    headers: formData.getHeaders(),
    cookies: { [TOKEN_COOKIE_HEADER]: TOKEN },
  });

  expect(rep.statusCode).toBe(403);
});

