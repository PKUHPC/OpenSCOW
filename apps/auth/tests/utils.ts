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

export const testUserUsername = "test";
export const testUserPassword = "test";

export const allowedCallbackUrl = "http://" + authConfig.allowedCallbackHostnames[0] + "/callback";
export const notAllowedCallbackUrl = "http://baddomain.com:29392/callback";

export const createFormData = (values: Record<string, string>) => {
  const formData = new URLSearchParams();
  Object.entries(values).forEach(([k, v]) => {
    formData.append(k, v);
  });

  const body = formData.toString();

  return {
    payload: body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  };
};
