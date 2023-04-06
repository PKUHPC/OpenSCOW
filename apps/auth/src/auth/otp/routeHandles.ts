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

import { parsePlaceholder } from "@scow/lib-config";
import { sshConnect } from "@scow/lib-ssh";
import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import ldapjs from "ldapjs";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import { bindOtpHtml } from "src/auth/bindOtpHtml";
import { findUser, useLdap } from "src/auth/ldap/helpers";
import { authConfig, LdapConfigSchema } from "src/config/auth";
import { rootKeyPair } from "src/config/env";
import { promisify } from "util";

import { aesDecryptData, generateIvAndKey } from "./aesUtils";
import { getAbsoluteUTCTimestamp, sendEmailAuthLink, storeOtpSessionAndGoSendEmailUI } from "./helper";


/**
   *  登录界面->绑定OTP界面
   *  绑定OTP界面->登录界面重定向
   * */
export function bindRedirectLoinUIAndBindUIRoute(f: FastifyInstance) {
  const QuerystringSchema = Type.Object({
    action: Type.String(),
    backToLoginUrl: Type.String(),
  });

  f.get<{
    Querystring: Static<typeof QuerystringSchema>
  }>(
    "/otp/bind",
    {
      schema: {
        querystring: QuerystringSchema,
      },
    },
    async (req, res) => {

      const { action, backToLoginUrl } = req.query;

      if (authConfig.otp.status === "local" && action === "bindOtp") {
        const backToLoginUrl = req.headers.referer;
        await bindOtpHtml(false, req, res, { backToLoginUrl: backToLoginUrl });
        return;
      }
      if (authConfig.otp.status === "remote" && action === "bindOtp") {

        if (!authConfig.otp.remote.redirectUrl) {
          res.redirect(backToLoginUrl);
          return;
        }

        res.redirect(authConfig.otp.remote.redirectUrl);
        return;
      }

      if (action === "backToLoginUI") {
        res.redirect(backToLoginUrl);
        return;
      }

    });
}

//  验证用户名密码->发送邮件页面
export function bindValidateUserNameAndPasswordRoute(f: FastifyInstance, ldapConfig: LdapConfigSchema) {
  const bodySchema = Type.Object({
    username: Type.String(),
    password: Type.String(),
    action: Type.String(),
    backToLoginUrl: Type.String(),
  });
  f.post<{ Body: Static<typeof bodySchema> }>("/otp/bind", {
    schema: { body: bodySchema },
  }, async (req, res) => {

    const { username, password, backToLoginUrl } = req.body;

    const logger = req.log.child({ plugin: "ldap" });
    await useLdap(logger, ldapConfig)(async (client) => {
      const user = await findUser(logger, ldapConfig, client, username).catch(async () => {
        await bindOtpHtml(true, req, res);
      });

      if (!user) {
        logger.info("Didn't find user with %s=%s", ldapConfig.attrs.uid, username);
        await bindOtpHtml(true, req, res);
        return;
      }
      logger.info("Trying binding as %s with credentials", user.dn);
      await useLdap(logger, ldapConfig, { dn: user.dn, password })(async () => {

        logger.info("Binding as %s successful. User info %o", user.dn, user);
        await storeOtpSessionAndGoSendEmailUI(f, req, res, ldapConfig, logger, client, backToLoginUrl,
          { dn: user.dn });
        return;
      }).catch(async (err) => {
        logger.info("error occurs. Err: %o", err);
        await bindOtpHtml(true, req, res);
      });

    });
  });
}

// 点击获取绑定链接
export function bindClickRequestBindingLinkRoute(
  f: FastifyInstance) {
  const bodySchema = Type.Object({
    otpSessionToken: Type.String(),
    emailAddress: Type.String(),
    backToLoginUrl: Type.String(),
  });
  f.post<{Body: Static<typeof bodySchema>}>(
    "/otp/sendEmail",
    {
      schema: {
        body: bodySchema,
      },
    },
    async (req, res) => {
      const { otpSessionToken, emailAddress, backToLoginUrl } = req.body;
      const logger = req.log;

      await sendEmailAuthLink(f, otpSessionToken, req, res, logger, emailAddress, backToLoginUrl);
    },
  );
}
// 点击邮箱中的绑定链接
export function bindClickAuthLinkInEmailRoute(
  f: FastifyInstance,
  ldapConfig: LdapConfigSchema,
) {
  const QuerystringSchema = Type.Object ({
    token: Type.String(),
    backToLoginUrl: Type.String(),
  });

  // 用于处理用户在邮箱中点击确认链接
  f.get<{
      Querystring: Static<typeof QuerystringSchema>
    }>(
      "/otp/email/validation",
      {
        schema: {
          querystring: QuerystringSchema,
        },
      },
      async (req, res) => {
        const { token, backToLoginUrl } = req.query;
        const logger = req.log;
        const decryptedOtpSessionToken = await aesDecryptData(f, token);
        if (!decryptedOtpSessionToken) {
          await bindOtpHtml(false, req, res,
            { sendEmailUI: true, redisUserInfoExpiration: true, backToLoginUrl: backToLoginUrl });
          return;
        }
        const redisUserJSON = await f.redis.get(decryptedOtpSessionToken);
        if (!redisUserJSON) {
          // 信息过期
          await bindOtpHtml(false, req, res,
            { sendEmailUI: true, redisUserInfoExpiration: true, backToLoginUrl: backToLoginUrl });
          return;
        }
        // 将secret信息存入ldap;
        const redisUserInfoObject = JSON.parse(redisUserJSON) as Record<string, string>;
        const secret = speakeasy.generateSecret({ length: 20 }).base32;
        await useLdap(logger, ldapConfig)(async (client) => {
          logger.info("Binding as %s successful.", redisUserInfoObject.dn);
          const modify = promisify(client.modify.bind(client));
          await modify(redisUserInfoObject.dn, new ldapjs.Change({
            operation: "replace",
            modification: {
              [authConfig.otp.secretAttributeName]: secret,
            },
          }),
          );
        });
        const uid = redisUserInfoObject.dn.match(/uid=([^,]+)/i)?.[1];
        const url = speakeasy.otpauthURL({
          secret: secret,
          label: `${uid}@scow`,
          issuer: uid as string,
          digits: authConfig.otp.digits,
          period: authConfig.otp.period,
          algorithm: authConfig.otp.algorithm,
          encoding: "base32",
        });
        const urlImg = await QRCode.toDataURL(url);
        await f.redis.del(decryptedOtpSessionToken);
        const html = `<div style="display: flex; justify-content: center;\
          align-items: center; height: 100vh; flex-direction: column">\
          <p>${authConfig.otp.qrcodeDescription}</p><img src="${urlImg}">\
          <input type="hidden" name="backToLoginUrl" value="${backToLoginUrl}"></div> `;
        res.header("Content-Type", "text/html; charset=utf-8").send(html);
      });
}

