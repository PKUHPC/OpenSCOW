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

import { validateToken } from "src/validateToken";
import { mockFetch } from "tests/utils";

const authUrl = "auth:5000";

const validToken = "123";


mockFetch((input) => {
  if (new URL(input as string).searchParams.get("token") === validToken) {
    return { status: 200, json: ({ identityId: validToken }) };
  } else {
    return { status: 403, json: ({}) };
  }

});

it("raises correct request", async () => {
  await validateToken(authUrl, validToken);

  expect(fetch).toHaveBeenCalledWith(
    authUrl + "/public/validateToken?token=" + validToken,
    { method: "GET" },
  );
});

it("fails test for invalid token", async () => {
  const result = await validateToken(authUrl, validToken + "123");

  expect(result).toBeUndefined();
});

it("returns identityId for valid token", async () => {
  const result = await validateToken(authUrl, validToken);

  expect(result).toEqual({ identityId: validToken });
});
