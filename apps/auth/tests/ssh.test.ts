/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

process.env.AUTH_TYPE = "ssh";

import { FastifyInstance } from "fastify";
import { buildApp } from "src/app";
import { createFormData } from "tests/utils";

const username = "test";
const password = "1234";
const token = "token";
const code = "code";

let server: FastifyInstance;

beforeEach(async () => {
  server = await buildApp();

  await server.ready();
});

afterEach(async () => {
  await server.close();
});

it("test to input a wrong verifyCode", async () => {

  const callbackUrl = "/callback";

  // login
  const { payload, headers } = createFormData({
    username: username,
    password: password,
    callbackUrl,
    token: token,
    code: "wrongCode",
  });
  await server.redis.set(token, code, "EX", 30);
  const resp = await server.inject({
    method: "POST",
    url: "/public/auth",
    payload,
    headers,
  });
  expect(resp.statusCode).toBe(400);
});

it("logs in to the ssh login", async () => {

  const callbackUrl = "/callback";

  const { payload, headers } = createFormData({
    username: username,
    password: password,
    callbackUrl: callbackUrl,
    token: token,
    code: code,
  });

  await server.redis.set(token, code, "EX", 30);
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
    token: token,
    code: code,
  });

  await server.redis.set(token, code, "EX", 30);
  const resp = await server.inject({
    method: "POST",
    path: "/public/auth",
    payload,
    headers,
  });

  expect(resp.statusCode).toBe(401);
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
