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

const CapabilitiesSchema = Type.Object({
  createUser: Type.Optional(Type.Boolean({ description: "是否可以创建用户" })),
  changePassword: Type.Optional(Type.Boolean({ description: "是否可以修改密码" })),
  getUser: Type.Optional(Type.Boolean({ description: "是否可以查询用户" })),
  accountUserRelation: Type.Optional(Type.Boolean({ description: "是否可以管理账户用户关系" })),
});

export type Capabilities = Static<typeof CapabilitiesSchema>;

const ResponsesSchema = Type.Object({
  200: CapabilitiesSchema,
});


export const getCapabilitiesRoute = fp(async (f) => {
  f.get<{
    Querystring: {},
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/capabilities",
    {
      schema: {
        response: ResponsesSchema.properties,
      },
    },
    async () => {

      const provider = f.auth;

      return {
        createUser: provider.createUser !== undefined,
        changePassword: provider.changePassword !== undefined,
        getUser: provider.getUser !== undefined,
        accountUserRelation: false,
      };
    },
  );
});
