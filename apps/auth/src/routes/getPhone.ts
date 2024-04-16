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
import { getPhoneByUserInfo, getPhoneByUserInfoProps } from "src/service/user";
import { isValidEmail, isValidPhoneNumber } from "src/utils/validations";

const QuerystringSchema = Type.Object({
  // 可能为手机号、邮箱、用户ID
  name: Type.String(),
});

enum ErrorCode {
  USER_NOT_FOUND = "USER_NOT_FOUND",
}

const ResponsesSchema = Type.Object({
  200: Type.Object({
    phone: Type.String(),
  }),
  404: Type.Object({
    code: Type.Enum(ErrorCode),
  }),
});

export const getPhoneRoute = fp(async (f) => {
  f.get<{
    Querystring: Static<typeof QuerystringSchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/public/getPhone",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {

      const { name } = req.query;
      const userInfo: getPhoneByUserInfoProps = {};

      if (isValidEmail(name)) {
        userInfo.email = name;
      }
      else if (isValidPhoneNumber(name)) {
        userInfo.phone = name;
      }
      else {
        userInfo.userId = name;
      }

      const { phone } = await getPhoneByUserInfo(userInfo);

      if (!phone) {
        return await rep.code(404).send({ code: ErrorCode.USER_NOT_FOUND });
      }

      return await rep.status(200).send({ phone });
    },
  );
});
