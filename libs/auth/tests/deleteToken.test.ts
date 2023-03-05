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

import { deleteToken } from "src/deleteToken";
import { applicationJsonHeaders } from "src/utils";
import { mockFetch } from "tests/utils";

const token = "123";

mockFetch((input) => {
  new URL(input as string).searchParams.get("token");
  return { status: 204 };
});

const authUrl = "auth:5000";

it("raises correct request", async () => {
  await deleteToken(token, authUrl);

  expect(fetch).toHaveBeenCalledWith(
    authUrl + "/token",
    {
      method: "DELETE",
      body: JSON.stringify(token),
      headers: applicationJsonHeaders,
    },
  );
});
