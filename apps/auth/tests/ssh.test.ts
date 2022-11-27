process.env.AUTH_TYPE = "ssh";

import { FastifyInstance } from "fastify";
import { buildApp } from "src/app";
import { createFormData } from "tests/utils";

const username = "test";
const password = "1234";

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

it("gets user info", async () => {
  const resp = await server.inject({
    method: "GET",
    url: "/user",
    query: { identityId: username },
  });

  expect(resp.statusCode).toBe(200);
  expect(resp.json()).toEqual({ user: { identityId: username } });
});

it("returns 404 if user doesn't exist", async () => {
  const resp = await server.inject({
    method: "GET",
    url: "/user",
    query: { identityId: username + "wrong" },
  });

  expect(resp.statusCode).toBe(404);
  expect(resp.json()).toEqual({ code: "USER_NOT_FOUND" });
});
