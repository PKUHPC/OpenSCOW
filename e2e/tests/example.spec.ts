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

import { expect, test } from "@playwright/test";

test("logins", async ({ page }) => {
  await page.goto("http://localhost:5001/");

  // eslint-disable-next-line max-len
  await expect(page).toHaveURL("http://localhost:5000/public/auth?callbackUrl=http%3A%2F%2Flocalhost%3A5001%2Fapi%2Fauth%2Fcallback");

  await page.getByPlaceholder("用户名").click();
  await page.getByPlaceholder("用户名").fill("demo_admin");
  await page.getByPlaceholder("密码").fill("demo_admin");
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page).toHaveURL("http://localhost:5001/dashboard");

});

