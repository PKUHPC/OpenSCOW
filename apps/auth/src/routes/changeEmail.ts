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
import { ChangeEmailResult } from "src/auth/AuthProvider";

const BodySchema = Type.Object({
  identityId: Type.String({ description: "用户ID" }),
  newEmail: Type.String({ description: "新邮箱" }),
});

const ResponsesSchema = Type.Object({
  204: Type.Null({ description: "修改完成" }),
  404: Type.Null({ description: "用户未找到" }),
  412: Type.Null({ description: "修改失败" }),
  501: Type.Null({ description: "当前配置不支持修改邮箱" }),
});

const codes: Record<ChangeEmailResult, number> = {
  NotFound: 404,
  OK: 204,
  Wrong: 412,
};

/**
 * 修改邮箱
 */
export const changeEmailRoute = fp(async (f) => {
  f.patch<{
    Body: Static<typeof BodySchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/email",
    {
      schema: {
        body: BodySchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {


      if (!f.auth.changeEmail) {
        return await rep.code(501).send(null);
      }



      const { identityId, newEmail } = req.body;

      const result = await f.auth.changeEmail(identityId, newEmail, req);

      await rep.code(codes[result]).send(null);
    },
  );
});
