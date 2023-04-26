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

import { authConfig } from "src/config/auth";
authConfig.ldap!.addUser = undefined;

import { FastifyInstance } from "fastify";
import { buildApp } from "src/app";
import { Capabilities } from "src/routes/capabilities";

let server: FastifyInstance;

beforeEach(async () => {
  server = await buildApp();

  await server.ready();
});

afterEach(async () => {
  await server.close();
});

it("should report no createUser capability", async () => {
  const resp = await server.inject({
    method: "GET",
    url: "/capabilities",
  });

  const body = await resp.json() as Capabilities;
  expect(body.createUser).toBeFalse();
});
