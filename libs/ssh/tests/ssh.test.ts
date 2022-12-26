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

import { executeAsUser } from "src/ssh";
import { connectToTestServerAsRoot, resetTestServerAsRoot, TestSshServer } from "tests/utils";

let testServer: TestSshServer;

beforeEach(async () => {
  testServer = await connectToTestServerAsRoot();
});

afterEach(async () => {
  await resetTestServerAsRoot(testServer);
});


it("execute command as another user", async () => {

  const resp = await executeAsUser(testServer.ssh, "test", console, false, "whoami", [], {});

  expect(resp.stdout).toBe("test");

});

