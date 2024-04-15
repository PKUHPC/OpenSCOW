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
import { cacheInfo } from "src/auth/cacheInfo";
import { findUser, useLdap } from "src/auth/ldap/helpers";
import { authConfig } from "src/config/auth";
import { getUserIdByEmailOrPhone } from "src/service/user";
import { ensureNotUndefined, isValidEmail, isValidPhoneNumber } from "src/utils/validations";

const BodySchema = Type.Object({
  // 密码登录时可能是userId、email和phone，验证码登录时只能是phone
  loginName: Type.String(),
  password: Type.Optional(Type.String()),
  verificationCode:Type.Optional(Type.String()),
});


enum NotFoundErrorCode {
  LOGIN_NAME_NOT_FOUND = "LOGIN_NAME_NOT_FOUND"
}


enum ErrorCode {
  LOGIN_NAME_OR_PASSWORD_WRONG = "LOGIN_NAME_OR_PASSWORD_WRONG",
  VERIFICATION_CODE_WRONG = "VERIFICATION_CODE_WRONG"
}

const ResponsesSchema = Type.Object({
  204: Type.Object({ token:Type.String() }),
  400: Type.Object({
    code: Type.Enum(ErrorCode),
  }),
  404: Type.Object({
    code: Type.Enum(NotFoundErrorCode),
  }),
});


/**
 * 创建用户
 */
export const loginRoute = fp(async (f) => {
  f.post<{
    Body: Static<typeof BodySchema>,
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/public/login",
    {
      schema: {
        body: BodySchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {

      const { loginName, password, verificationCode } = req.body;

      // 账号、邮件和手机号密码登录
      if (password) {
        const isEmail = isValidEmail(loginName);
        const isPhone = isValidPhoneNumber(loginName);
        let userId: string | undefined = loginName;

        if (isEmail) {
          const res = await getUserIdByEmailOrPhone({ email:loginName });
          userId = res.userId;
        }
        else if (isPhone) {
          const res = await getUserIdByEmailOrPhone({ phone:loginName });
          userId = res.userId;
        }

        const logger = req.log.child({ plugin: "ldap" });
        const { ldap } = ensureNotUndefined(authConfig, ["ldap"]);

        await useLdap(logger, ldap)(async (client) => {

          const user = await findUser(logger, ldap, client, userId ?? loginName);

          if (!user) {
            logger.info("Didn't find user with %s=%s", ldap.attrs.uid, loginName);
            return await rep.code(404).send({ code: NotFoundErrorCode.LOGIN_NAME_NOT_FOUND });
          }

          await useLdap(logger, ldap, { dn: user.dn, password })(async () => {
            logger.info("Binding as %s successful. User info %o", user.dn, user);
            const token = await cacheInfo(user.identityId, req);
            return await rep.code(200).send({ token });
          }).catch(async (err) => {
            logger.info("Binding as %s failed. Err: %o", user.dn, err);
            return await rep.code(400).send({ code: ErrorCode.LOGIN_NAME_OR_PASSWORD_WRONG });
          });

        },
        );
      }
      // 手机验证码登录
      else {
        const res = await getUserIdByEmailOrPhone({ phone:loginName });

        if (!res.userId) {
          return await rep.code(404).send({ code: NotFoundErrorCode.LOGIN_NAME_NOT_FOUND });
        }

        const redisVerificationCode = await req.server.redis.get(loginName);

        if (redisVerificationCode !== verificationCode) {
          return await rep.code(400).send({ code: ErrorCode.VERIFICATION_CODE_WRONG });
        }
        await req.server.redis.del(loginName);

        const token = await cacheInfo(res.userId, req);
        return await rep.code(200).send({ token });

      }
    },
  );
});
