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

import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { DeleteUserResult } from "src/auth/AuthProvider";

const QuerystringSchema = Type.Object({
  identityId: Type.String({ description: "用户ID" }),
});

const ResponsesSchema = Type.Object({
  204: Type.Null({ description: "删除成功" }),
  404: Type.Null({ description: "未找到该用户" }),
  501: Type.Null({ description: "不支持ldap禁止用户登录" }),
});

const codes: Record<DeleteUserResult, number> = {
  NotFound: 404,
  OK: 204,
  Faild: 501,
};

/**
 * 删除用户，其实是改变用户状态
 */
export const deleteUserRoute = fp(async (f) => {
  f.delete<{
    Querystring: Static<typeof QuerystringSchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/user/delete",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      if (!f.auth.deleteUser) {
        return await rep.code(501).send({ code: "NOT_SUPPORTED" });
      }

      const { identityId } = req.query;

      const result = await f.auth.deleteUser(identityId, req);

      return await rep.status(codes[result]).send(null);
    },
  );
});
