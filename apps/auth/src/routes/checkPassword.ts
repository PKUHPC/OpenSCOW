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

const QuerystringSchema = Type.Object({
  identityId: Type.String(),
  password: Type.String(),
});

const ResponsesSchema = Type.Object({
  200: Type.Object({
    result: Type.Boolean({ description: "验证结果，ID和密码是否匹配" }),
  }),
  404: Type.Null({ description: "用户ID不存在" }),
  501: Type.Null({ description: "此功能在当前服务器配置下不可用" }),
});

/**
 * 验证一个ID和密码是否匹配。
 */
export const checkPasswordRoute = fp(async (f) => {
  f.get<{
    Querystring: Static<typeof QuerystringSchema>;
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/checkPassword",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      if (!f.auth.checkPassword) {
        return await rep.code(501).send(null);
      }

      const { identityId, password } = req.query;

      const result = await f.auth.checkPassword(identityId, password, req);

      if (result === "Match") {
        return { result: true };
      } else if (result === "NotMatch") {
        return { result: false };
      } else if (result === "NotFound") {
        await rep.status(404).send(null);
        return;
      }
      throw new Error("Unexpected result from checkPassword");
    },
  );
});