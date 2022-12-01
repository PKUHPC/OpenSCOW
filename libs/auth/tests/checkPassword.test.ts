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

import { checkPassword } from "src/checkPassword";
import { mockFetch } from "tests/utils";

const authUrl = "auth:5000";

const identityId = "123";

const password = "123456";

mockFetch((input) => {
  const testUrl = new URL(input as string);
  if (testUrl.pathname !== "/checkPassword" || testUrl.searchParams.get("identityId") !== identityId) {
    return { status: 404, json: ({}) };
  }
  else if (testUrl.searchParams.get("password") === password) {
    return { status: 200, json: ({ success: true }) };
  } else {
    return { status: 200, json: ({ success: false }) };
  }
});

it("raises correct request", async () => {
  await checkPassword(authUrl, identityId, password);
    
  expect(fetch).toHaveBeenCalledWith(
    authUrl + "/checkPassword?identityId=" + identityId + "&password=" + password,
    { method: "GET" },
  );
});

it("fails test for changing password with the user who cannot be found", async () => {
  try {
    await checkPassword(authUrl, identityId + "123", password);
  } catch (e: any) {
    expect(e.status).toBe(404);
  }
});

it("fails test for invalid password", async () => {
  const result = await checkPassword(authUrl, identityId, password + "123");
        
  expect(result?.success).toBe(false);
});

it("succeeds test for valid password", async () => {
  const result = await checkPassword(authUrl, identityId, password);
            
  expect(result?.success).toBe(true);
});

