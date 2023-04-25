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
import { saveCaptchaText } from "src/auth/captcha";
import { allowedCallbackUrl, createFormData, testUserPassword, testUserUsername } from "tests/utils";

const username = testUserUsername;
const password = testUserPassword;
const captchaToken = "captchaToken";
const captchaCode = "captchaToken";

let server: FastifyInstance;

beforeEach(async () => {
  server = await buildApp();

  await server.ready();
});

afterEach(async () => {
  await server.close();
});

const callbackUrl = allowedCallbackUrl;

it("test to input a wrong verifyCaptcha", async () => {


  // login
  const { payload, headers } = createFormData({
    username: username,
    password: password,
    callbackUrl,
    token: captchaToken,
    code: "wrongCaptcha",
  });
  await saveCaptchaText(server, captchaCode, captchaToken);
  const resp = await server.inject({
    method: "POST",
    url: "/public/auth",
    payload,
    headers,
  });
  expect(resp.statusCode).toBe(400);
});

it("logs in to the ssh login", async () => {

  const { payload, headers } = createFormData({
    username: username,
    password: password,
    callbackUrl: callbackUrl,
    token: captchaToken,
    code: captchaCode,
  });

  await saveCaptchaText(server, captchaCode, captchaToken);
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

  const { payload, headers } = createFormData({
    username: username,
    password: password + "a",
    callbackUrl: callbackUrl,
    token: captchaToken,
    code: captchaCode,
  });

  await saveCaptchaText(server, captchaCode, captchaToken);
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
  expect(resp.json()).toEqual({ user: {
    identityId: username,
    name: "Linux User",
  } });
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
