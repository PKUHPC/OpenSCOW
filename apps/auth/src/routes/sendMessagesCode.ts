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
import { authConfig } from "src/config/auth";
import { genVerification } from "src/utils/genId";
import { sendMessage, TemplateCode } from "src/utils/sendMessage";


const QuerystringSchema = Type.Object({
  phone: Type.String(),
  isRegister: Type.Optional(Type.Boolean({ description: "是否为注册用户" })),
});

export enum ErrorCode {
  EXCEED_SEND_TIMES = "EXCEED_SEND_TIMES",
  SEND_MESSAGE_CODE_FAILED = "SEND_MESSAGE_CODE_FAILED"
}

const ResponsesSchema = Type.Object({
  200: Type.Null(),

  400: Type.Object({
    code: Type.Enum(ErrorCode),
  }),
});

export const sendMessagesCodeRoute = fp(async (f) => {
  f.get<{
    Querystring: Static<typeof QuerystringSchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/public/sendMessagesCode",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {

      const { phone, isRegister } = req.query;

      // todo
      if (isRegister) {

      } else {

      }
      const verificationCode = genVerification();
      // 记录手机发送验证码次数
      const phoneSendCodeTimesKey = `${phone}-sendCodeTimes`;
      const phoneSendTimes = await req.server.redis.incr(phoneSendCodeTimesKey);


      if (phoneSendTimes === 1) {
        await req.server.redis.expire(phoneSendCodeTimesKey, authConfig.sendMessageCodeTimeoutSeconds);
      }

      if (phoneSendTimes > 5) {
        // 发送不成功，减去前面加的次数
        await req.server.redis.decr(phoneSendCodeTimesKey);
        return await rep.code(400).send(
          {
            code: ErrorCode.EXCEED_SEND_TIMES,
            message: "sending message code is over 5 in 5 minutes",
          },
        );
      }

      const { result } = await sendMessage({
        phoneNumbers:phone,
        templateCode:TemplateCode.sendVerification,
        templateParam: { code: verificationCode },
      });

      if (result !== "OK") {
        // 发送不成功，减去前面加的次数
        await req.server.redis.decr(phoneSendCodeTimesKey);

        return await rep.code(400).send(
          {
            code: ErrorCode.SEND_MESSAGE_CODE_FAILED,
            message: "send message code failed",
          },
        );
      }

      await req.server.redis.set(phone,
        verificationCode, "EX", authConfig.verificationCodeTimeoutSeconds,
      );

    },
  );
});
