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
import { FastifyInstance } from "fastify";
import ldapjs from "ldapjs";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import { bindOtpHtml } from "src/auth/bindOtpHtml";
import { findUser, useLdap } from "src/auth/ldap/helpers";
import { authConfig, LdapConfigSchema, OtpConfigSchema, OtpLdapSchema, OtpStatusOptions } from "src/config/auth";
import { promisify } from "util";

import { decryptData } from "./aesUtils";
import { getIvAndKey, getOtpSession, renderLiquidFile,
  sendEmailAuthLink, storeOtpSessionAndGoSendEmailUI } from "./helper";


/**
   *  登录界面->绑定OTP界面
   *  绑定OTP界面->登录界面重定向
   * */
export function redirectLoinUIAndBindUIRoute(f: FastifyInstance, otp: OtpConfigSchema) {
  const QuerystringSchema = Type.Object({
    action: Type.Enum({ bindOtp: "bindOtp", backToLoginUI: "backToLoginUI" }),
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
      if (otp.type === OtpStatusOptions.ldap && action === "bindOtp") {
        const backToLoginUrl = req.headers.referer;
        await bindOtpHtml(false, req, res, { backToLoginUrl: backToLoginUrl });
        return;
      }
      if (otp.type === OtpStatusOptions.remote && action === "bindOtp") {
        if (!otp.remote!.redirectUrl) {
          res.redirect(backToLoginUrl);
          return;
        }

        res.redirect(otp.remote!.redirectUrl);
        return;
      }

      if (action === "backToLoginUI") {
        res.redirect(backToLoginUrl);
        return;
      }

    });
}

//  验证用户名密码->发送邮件页面
export function validateUserNameAndPasswordRoute(f: FastifyInstance, ldapConfig: LdapConfigSchema) {
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
          authConfig.otp!.ldap!.bindLimitMinutes, { dn: user.dn });
        return;
      }).catch(async (err) => {
        logger.info("error occurs. Err: %o", err);
        await bindOtpHtml(true, req, res);
      });

    });
  });
}

// 点击获取绑定链接
export function clickRequestBindingLinkRoute(
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

      await sendEmailAuthLink(
        f, otpSessionToken, req, res, logger, emailAddress, backToLoginUrl, authConfig.otp!.ldap!);
    },
  );
}
// 点击邮箱中的绑定链接
export function clickAuthLinkInEmailRoute(
  f: FastifyInstance,
  ldapConfig: LdapConfigSchema,
  otpLdap: OtpLdapSchema,
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
        const ivAndKey = await getIvAndKey(f);
        if (!ivAndKey) {
          // 返回用户信息过期
          await bindOtpHtml(false, req, res,
            { bindLimitMinutes: otpLdap.bindLimitMinutes, tokenNotFound: true, backToLoginUrl: backToLoginUrl });
          return;
        }
        const decryptedOtpSessionToken = decryptData(ivAndKey, token);
        const otpSession = await getOtpSession(decryptedOtpSessionToken, f);
        if (!otpSession) {
          // 信息过期
          await bindOtpHtml(false, req, res,
            { bindLimitMinutes: otpLdap.bindLimitMinutes, tokenNotFound: true, backToLoginUrl: backToLoginUrl });
          return;
        }
        // 将secret信息存入ldap;
        const secret = speakeasy.generateSecret({ length: 20 }).base32;
        await useLdap(logger, ldapConfig)(async (client) => {
          logger.info("Binding as %s successful.", otpSession.dn);
          const modify = promisify(client.modify.bind(client));
          await modify(otpSession.dn, new ldapjs.Change({
            operation: "replace",
            modification: {
              [otpLdap.secretAttributeName]: secret,
            },
          }),
          );
        });
        const uid = otpSession.dn.match(/uid=([^,]+)/i)?.[1];
        const url = speakeasy.otpauthURL({
          secret: secret,
          label: `${uid}@${otpLdap.label}`,
          issuer: uid as string,
          digits: 6,
          period: 30,
          algorithm: "sha1",
          encoding: "base32",
        });
        const urlImg = await QRCode.toDataURL(url);
        await f.redis.del(decryptedOtpSessionToken);
        const renderedFile = await renderLiquidFile("qrcode", {
          contentText: otpLdap.qrcodeDescription,
          urlImg,
          backToLoginUrl,
        });
        res.header("Content-Type", "text/html; charset=utf-8").send(renderedFile);
      });
}

