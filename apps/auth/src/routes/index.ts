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

import { checkPassword } from "src/auth/ldap/password";
import { getCapabilitiesRoute } from "src/routes/capabilities";
import { changePasswordRoute } from "src/routes/changePassword";
import { createUserRoute } from "src/routes/createUser";
import { getUserRoute } from "src/routes/getUser";
import { logoutRoute } from "src/routes/logout";
import { validateNameRoute } from "src/routes/validateName";

import { authRoute } from "./auth";
import { authCallbackRoute } from "./callback";
import { validateTokenRoute } from "./validateToken";

export const routes = [
  authRoute,
  authCallbackRoute,
  validateTokenRoute,
  validateNameRoute,
  createUserRoute,
  changePasswordRoute,
  logoutRoute,
  getCapabilitiesRoute,
  getUserRoute,
  checkPassword,
];
