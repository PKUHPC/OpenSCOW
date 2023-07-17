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
import { ChangePasswordResult } from "src/auth/AuthProvider";

const BodySchema = Type.Object({
  identityId: Type.String({ description: "用户ID" }),
  oldPassword: Type.String({ description: "原密码" }),
  newPassword: Type.String({ description: "新密码" }),
});

const ResponsesSchema = Type.Object({
  204: Type.Null({ description: "修改完成" }),
  404: Type.Null({ description: "用户未找到" }),
  412: Type.Null({ description: "原密码不正确" }),
  501: Type.Null({ description: "当前配置不支持修改密码" }),
});

const codes: Record<ChangePasswordResult, number> = {
  NotFound: 404,
  OK: 204,
};

/**
 * 修改密码
 */
export const changePasswordRoute = fp(async (f) => {
  f.patch<{
    Body: Static<typeof BodySchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/password",
    {
      schema: {
        body: BodySchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {

      if (!f.auth.changePassword) {
        return await rep.code(501).send(null);
      }

      const { identityId, newPassword } = req.body;

      const result = await f.auth.changePassword(identityId, newPassword, req);

      await rep.code(codes[result]).send(null);
    },
  );
});
