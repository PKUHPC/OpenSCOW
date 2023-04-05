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

import * as crypto from "crypto";
import { FastifyBaseLogger, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import ldapjs from "ldapjs";
import * as nodemailer from "nodemailer";
import { TransportOptions } from "nodemailer";
import * as speakeasy from "speakeasy";
import { bindOtpHtml } from "src/auth/bindOtpHtml";
import { extractAttr, searchOne, takeOne } from "src/auth/ldap/helpers";
import { serveLoginHtml } from "src/auth/loginHtml";
import { authConfig, LdapConfigSchema, otpStatusOptions } from "src/config/auth";
import * as url from "url";

import { aesDecryptData, aesEncryptData } from "./aesUtils";

export async function storeOtpSessionAndGoSendEmailUI(
  f: FastifyInstance,
  req: FastifyRequest,
  res: FastifyReply,
  ldapConfig: LdapConfigSchema,
  logger: FastifyBaseLogger,
  client: ldapjs.Client,
  backToLoginUrl: string,
  userInfo: {
    dn: string,
  },
) {
  const otpSessionToken = crypto.randomUUID();
  const encryptOtpSessionToken = aesEncryptData(otpSessionToken);
  await f.redis.set(otpSessionToken, JSON.stringify(userInfo), "EX", 600);
  const mailAttributeName = ldapConfig.attrs.mail || "mail";
  const emailAddressInfo =
    await searchOneAttributeValueFromLdap(userInfo.dn, logger, mailAttributeName, client);
  await bindOtpHtml(false, req, res,
    { sendEmailUI: true, otpSessionToken: encryptOtpSessionToken,
      emailAddress: emailAddressInfo?.value, backToLoginUrl });
  return;
}

export async function sendEmailAuthLink(
  f: FastifyInstance,
  otpSessionToken: string,
  req: FastifyRequest,
  res: FastifyReply,
  logger: FastifyBaseLogger,
  emailAddress: string,
  backToLoginUrl: string,
) {
  const redisUserJSON = await f.redis.get(aesDecryptData(otpSessionToken));
  if (!redisUserJSON) {
    // 信息过期
    await bindOtpHtml(false, req, res,
      { sendEmailUI: true, redisUserInfoExpiration: true,
        otpSessionToken: otpSessionToken, backToLoginUrl: backToLoginUrl });
    return;
  }

  const redisUserInfoObject = JSON.parse(redisUserJSON) as Object;
  const currentTimestamp = getAbsoluteUTCTimestamp();
  if (redisUserInfoObject["sendEmaililTimestamp"] !== undefined) {
    // 获取邮件链接需间隔至少60秒
    const timeDiff = Math.floor(currentTimestamp / 1000 - redisUserInfoObject["sendEmaililTimestamp"]);
    if (timeDiff < 60) {
      await bindOtpHtml(
        false, req, res,
        { sendEmailUI: true, emailAddress: emailAddress,
          timeDiffNotEnough: 60 - timeDiff, otpSessionToken, backToLoginUrl: backToLoginUrl });
      return;
    }
  }
  redisUserInfoObject["sendEmaililTimestamp"] = Math.floor(currentTimestamp / 1000);
  const ttl = await f.redis.ttl(aesDecryptData(otpSessionToken));
  await f.redis.set(aesDecryptData(otpSessionToken), JSON.stringify(redisUserInfoObject), "EX", ttl);
  const transporter = nodemailer.createTransport({
    host: authConfig.otp.authenticationMethod.mail.mailTransportInfo.host,
    port: authConfig.otp.authenticationMethod.mail.mailTransportInfo.port,
    secure: authConfig.otp.authenticationMethod.mail.mailTransportInfo.secure,
    auth: {
      user: authConfig.otp.authenticationMethod.mail.mailTransportInfo.user,
      pass: authConfig.otp.authenticationMethod.mail.mailTransportInfo.password,
    },
  } as TransportOptions);
  const authUrl = new URL(authConfig.otp.authUrl);
  const htmlTemplate = "<h1>{{title}}</h1> \
  <p>{{contentText}}</p><a target=\"_blank\" href=\""
  + url.format({
    protocol: authUrl.protocol,
    host: authUrl.host,
    pathname: "/otp/email/validation",
    query: {
      token: otpSessionToken,
      backToLoginUrl: backToLoginUrl,
    },
  }) + "\">{{labelText}}</a>";

  const mailOptions = {
    from: authConfig.otp.authenticationMethod.mail.from,
    to: emailAddress,
    subject: authConfig.otp.authenticationMethod.mail.subject,
    html: htmlTemplate.replace("{{title}}", authConfig.otp.authenticationMethod.mail.title)
      .replace("{{contentText}}", authConfig.otp.authenticationMethod.mail.contentText)
      .replace("{{labelText}}", authConfig.otp.authenticationMethod.mail.labelText),
  };

  let success = true;
  try {
    await transporter.sendMail(mailOptions);
    logger.info("email sent successfully");
  } catch (e) {
    logger.info("fail to send email", e);
    success = false;
  }

  await bindOtpHtml(
    false, req, res,
    { sendEmailUI: true, sendSucceeded: success,
      emailAddress: emailAddress, otpSessionToken: otpSessionToken, backToLoginUrl: backToLoginUrl });
}

export function getAbsoluteUTCTimestamp() {
  const currentTime = new Date();
  return Date.UTC(currentTime.getUTCFullYear(), currentTime.getUTCMonth(), currentTime.getUTCDate(),
    currentTime.getUTCHours(), currentTime.getUTCMinutes(), currentTime.getUTCSeconds(),
    currentTime.getUTCMilliseconds());
}

export async function searchOneAttributeValueFromLdap(
  dn: string, logger: FastifyBaseLogger, attributeName: string,
  client: ldapjs.Client) {
  return await searchOne(logger, client, dn,
    {
      scope: "base",
      filter: "(objectClass=*)",
      attributes: ["*"],
    }, (e) => {
      const value = takeOne(extractAttr(e, attributeName));
      return { value };
    },
  );
}

interface UserInfo {
  userId: string,
  dn: string,
}

export async function validateOtpCode(
  userInfo: UserInfo,
  inputCode: string | undefined,
  callbackUrl: string,
  req: FastifyRequest,
  res: FastifyReply,
  logger: FastifyBaseLogger,
  client: ldapjs.Client,
) {
  if (authConfig.otp.status === otpStatusOptions.disabled) {
    return true;
  }
  if (!inputCode) {
    await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
    return false;
  }

  const time = getAbsoluteUTCTimestamp();

  if (authConfig.otp.status === otpStatusOptions.remote) {
    if (!authConfig.otp.remote.url || !authConfig.otp.remote.url)
    {
      logger.info("otp.remoteConfig.validateCodeUrl is undefined");
      return undefined;
    }

    const result = await fetch(authConfig.otp.remote.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        otpCode: inputCode,
        userId: userInfo.userId,
      }),
    }).then(async (res) => {

      return (await JSON.parse(await res.text()).result) as boolean;
    })
      .catch((e) => {
        logger.error(`error in verify otp code in remote status, error ${e}`);
        return false;
      });

    if (result) {
      return true;
    } else {
      await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
      return false;
    }

  }
  // 如果是otp.status是local
  const secretInfo = await searchOneAttributeValueFromLdap(
    userInfo.dn, logger, authConfig.otp.secretAttributeName, client);
  if (!secretInfo?.value) {
    logger.info("fail to find otp secret");
    await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
    return false;
  }
  const result = speakeasy.totp.verify({
    token: inputCode,
    time: time / 1000,
    encoding: "base32",
    secret: secretInfo.value,
    digits: authConfig.otp.digits,
    step: authConfig.otp.period,
    algorithm: authConfig.otp.algorithm,
  });
  if (result) {
    return true;
  } else {
    await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
    return false;
  }
}

