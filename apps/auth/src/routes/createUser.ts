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
import { CreateUserResult } from "src/auth/AuthProvider";

const BodySchema = Type.Object({
  mail: Type.String(),
  id: Type.Integer(),
  identityId: Type.String(),
  name: Type.String(),
  password: Type.String(),
});

const ResponsesSchema = Type.Object({
  // 不能用Any或者Unknown
  // 因为生成的json schema为{ description: "" }
  // fastify将会把这种格式认为是一个只包含有description key的object
  // https://www.fastify.io/docs/latest/Reference/Validation-and-Serialization/#serialization

  204: Type.Null({ description: "创建成功" }),
  409: Type.Null({ description: "用户ID已经存在" }),
  501: Type.Null({ description: "此功能在当前服务器配置下不可用" }),
});

const codes: Record<CreateUserResult, number> = {
  AlreadyExists: 409,
  OK: 204,
};

/**
 * 创建用户
 */
export const createUserRoute = fp(async (f) => {
  f.post<{
    Body: Static<typeof BodySchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/user",
    {
      schema: {
        body: BodySchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      if (!f.auth.createUser) {
        return await rep.code(501).send(null);
      }

      const { ...rest } = req.body;

      const result = await f.auth.createUser(rest, req);

      return await rep.status(codes[result]).send();
    },
  );
});
