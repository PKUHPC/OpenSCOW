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

import { executeAsUser, getEnvPrefix } from "src/ssh";
import { connectToTestServerAsRoot, resetTestServerAsRoot, TestSshServer } from "tests/utils";

let testServer: TestSshServer;

beforeEach(async () => {
  testServer = await connectToTestServerAsRoot();
});

afterEach(async () => {
  await resetTestServerAsRoot(testServer);
});


const TEST_USER = "test";

it.each([
  [["whoami", [], {}], TEST_USER],
  [["echo", ["$USER"], {}], TEST_USER],
  [["echo", ["$USER $TEST", "$TEST"], { TEST: "1" }], `${TEST_USER} 1 1`],
] as const)("execute command as another user", async ([cmd, parameters, env], stdout) => {

  const resp = await executeAsUser(testServer.ssh, TEST_USER, console, false, cmd, parameters, {
    execOptions: { env },
  });

  expect(resp.stdout).toBe(stdout);

});

it.each([
  [{ test: "1" }, "test=1 "],
  [{ test: "1", test2: "2" }, "test=1 test2=2 "],
  [{ test: "1", test2: "2\"" }, "test=1 test2='2\"' "],
])("gets correct env prefix", async (env, expected) => {
  expect(getEnvPrefix(env)).toBe(expected);
});
