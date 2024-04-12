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
import { checkUserExisted, registerUser } from "src/service/user";

const BodySchema = Type.Object({
  country: Type.String(),
  userId: Type.String(),
  userName: Type.String(),
  email: Type.String(),
  phone: Type.String(),
  verificationCode: Type.String(),
  password: Type.String(),
});

enum ExistedErrorCode {
  USER_ID_EXISTED = "USER_ID_EXISTED",
  EMAIL_EXISTED = "EMAIL_EXISTED",
  PHONE_EXISTED = "PHONE_EXISTED",
}

enum ErrorCode {
  VERIFICATION_CODE_WRONG = "VERIFICATION_CODE_WRONG"
}

const ResponsesSchema = Type.Object({

  204: Type.Null({ description: "创建成功" }),
  409: Type.Object({
    code: Type.Enum(ExistedErrorCode),
  }),
  400: Type.Object({
    code: Type.Enum(ErrorCode),
  }),
});


/**
 * 创建用户
 */
export const createUserRoute = fp(async (f) => {
  f.post<{
    Body: Static<typeof BodySchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/public/register",
    {
      schema: {
        body: BodySchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {

      const { verificationCode, userId, email, phone, ...rest } = req.body;

      const userExisted = await checkUserExisted(userId, phone, email);

      if (userExisted.emailExisted) {
        return await rep.code(409).send({ code: ExistedErrorCode.EMAIL_EXISTED });
      }
      else if (userExisted.phoneExisted) {
        return await rep.code(409).send({ code: ExistedErrorCode.PHONE_EXISTED });
      }
      else if (userExisted.userIdExisted) {
        return await rep.code(409).send({ code: ExistedErrorCode.USER_ID_EXISTED });
      }

      console.log("verificationCode", verificationCode);
      // const redisVerificationCode = await req.server.redis.get(phone);

      // if (redisVerificationCode !== verificationCode) {
      //   return await rep.code(400).send({ code: ErrorCode.VERIFICATION_CODE_WRONG });
      // }

      await registerUser({ userId, email, phone, ...rest });

      return await rep.code(204).send();
    },
  );
});
