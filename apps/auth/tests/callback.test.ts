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
import { CallbackHostnameNotAllowedError } from "src/auth/callback";
import { CAPTCHA_TOKEN_PREFIX } from "src/auth/captcha";
import { allowedCallbackUrl, createFormData,
  notAllowedCallbackUrl, testUserPassword, testUserUsername } from "tests/utils";

const username = testUserUsername;
const password = testUserPassword;
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


it("allows to login page with allowed callback url", async () => {

  const resp = await server.inject({
    method: "GET",
    path: "/public/auth",
    query: { callbackUrl: allowedCallbackUrl },
  });

  expect(resp.statusCode).toBe(200);

});

// TODO this test did not exit one second after the test run has completed.

it("doesn't allow to login page with not allowed callback url", async () => {
  const resp = await server.inject({
    method: "GET",
    path: "/public/auth",
    query: { callbackUrl: notAllowedCallbackUrl },
  });

  expect(resp.statusCode).toBe(400);
  expect(resp.json().code).toBe(new CallbackHostnameNotAllowedError().code);
});

it("redirects to allowed origin after login", async () => {

  const { payload, headers } = createFormData({
    username: username,
    password: password,
    callbackUrl: allowedCallbackUrl,
    token: token,
    code: code,
  });

  await server.redis.set(CAPTCHA_TOKEN_PREFIX + token, code, "EX", 30);
  const resp = await server.inject({
    method: "POST",
    path: "/public/auth",
    payload,
    headers,
  });

  expect(resp.statusCode).toBe(302);
  expect(resp.headers.location).toStartWith(allowedCallbackUrl + "?token=");
});

it("doesn't redirect to not allowed origin after login", async () => {

  const { payload, headers } = createFormData({
    username: username,
    password: password,
    callbackUrl: notAllowedCallbackUrl,
    token: token,
    code: code,
  });

  await server.redis.set(CAPTCHA_TOKEN_PREFIX + token, code, "EX", 30);
  const resp = await server.inject({
    method: "POST",
    path: "/public/auth",
    payload,
    headers,
  });

  expect(resp.statusCode).toBe(400);
  expect(resp.json().code).toBe(new CallbackHostnameNotAllowedError().code);
});
