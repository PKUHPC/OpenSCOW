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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { Static, Type } from "@sinclair/typebox";
import { validateToken } from "src/auth/token";
import { route } from "src/utils/route";


export const UserInfo = Type.Object({
  identityId: Type.String(),
  name: Type.Optional(Type.String()),
});

export type UserInfo = Static<typeof UserInfo>;

export const ValidateTokenSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({ token: Type.String() }),

  responses: {
    200: UserInfo,
    403: Type.Null(),
  },
});

export default route(ValidateTokenSchema, async (req) => {

  const { token } = req.query;

  const info = await validateToken(token);

  if (!info) { return { 403: null }; }

  return { 200: info };

});


