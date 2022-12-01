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

import { applicationJsonHeaders } from "src/utils";
import { mockFetch } from "tests/utils";

import { changePassword } from "../src/changePassword";

const authUrl = "auth:5000";

const identityId = "123";

const newPassword = "654321";

mockFetch((input, init) => {
  const testBody = JSON.parse(init!.body as string);
  const testIdentityId = testBody.identityId;

  if (testIdentityId !== identityId) {
    return { status: 404 };
  }
  else {
    return { status: 204 };
  }

});

it("raises correct request for changing password", async () => {
  await changePassword(authUrl, { identityId, newPassword });

  expect(fetch).toHaveBeenCalledWith(
    authUrl + "/password",
    {
      method: "PATCH",
      body: JSON.stringify({ identityId, newPassword }),
      headers: applicationJsonHeaders,
    },
  );
});

it("fails test for changing password with the user who cannot be found", async () => {
  try {
    await changePassword(authUrl, { identityId: identityId + "123", newPassword });
    expect("").fail("Change password success");
  } catch (e: any) {
    expect(e.status).toBe(404);
  }
});

it("succeeds when changing password", async () => {
  await changePassword(authUrl, { identityId, newPassword });
});
