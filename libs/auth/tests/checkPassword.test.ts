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
import { applicationJsonHeaders } from "src/utils";
import { mockFetch } from "tests/utils";

const authUrl = "auth:5000";

const identityId = "123";

const password = "123456";

mockFetch((input) => {
  const query = new URL(input as string).searchParams;
  const urlIdentityId = query.get("identityId");
  const urlPassword = query.get("password");
  if (urlIdentityId !== identityId) {
    return { status: 404, json: ({}) };
  }
  else if (urlPassword === password) {
    return { status: 200, json: ({ success: true }) };
  } else {
    return { status: 200, json: ({ success: false }) };
  }
});

it("raises correct request for checking password", async () => {
  await checkPassword(authUrl, { identityId: identityId, password: password });
  expect(fetch).toHaveBeenCalledWith(
    authUrl + "/checkPassword?identityId=" + identityId + "&password=" + password,
    {
      headers: applicationJsonHeaders,
      method: "GET",
    },
  );
});

it("fails test for changing password with the user who cannot be found", async () => {
  try {
    await checkPassword(authUrl, { identityId: identityId + "123", password: password });
  } catch (e: any) {
    expect(e.status).toBe(404);
  }
});

it("fails test for invalid password", async () => {
  const result = await checkPassword(authUrl, { identityId: identityId, password: password + "123" });

  expect(result?.success).toBe(false);
});

it("succeeds test for valid password", async () => {
  const result = await checkPassword(authUrl, { identityId, password });

  expect(result?.success).toBe(true);
});
