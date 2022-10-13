process.env.AUTH_TYPE = "ssh";

import { FastifyInstance } from "fastify";
import { buildApp } from "src/app";
import { createFormData } from "tests/utils";

const username = "test";
const password = username;

let server: FastifyInstance;

beforeEach(async () => {
  server = await buildApp();

  await server.ready();
});

afterEach(async () => {
  await server.close();
});

it("logs in to the ssh login", async () => {

  const callbackUrl = "/callback";

  const { payload, headers } = createFormData({
    username: username,
    password: password,
    callbackUrl: callbackUrl,
  });

  const resp = await server.inject({
    method: "POST",
    path: "/public/auth",
    payload,
    headers,
  });

  expect(resp.statusCode).toBe(302);
  expect(resp.headers.location).toStartWith(callbackUrl + "?");
});

it("fails to login with wrong credentials", async () => {

  const callbackUrl = "/callback";


  const { payload, headers } = createFormData({
    username: username,
    password: password + "a",
    callbackUrl: callbackUrl,
  });

  const resp = await server.inject({
    method: "POST",
    path: "/public/auth",
    payload,
    headers,
  });

  expect(resp.statusCode).toBe(403);
});
