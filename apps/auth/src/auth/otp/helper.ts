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
import { Liquid } from "liquidjs";
import * as nodemailer from "nodemailer";
import { TransportOptions } from "nodemailer";
import path from "path";
import * as speakeasy from "speakeasy";
import { bindOtpHtml } from "src/auth/bindOtpHtml";
import { extractAttr, searchOne, takeOne } from "src/auth/ldap/helpers";
import { serveLoginHtml } from "src/auth/loginHtml";
import { authConfig, LdapConfigSchema, OtpStatusOptions } from "src/config/auth";
import * as url from "url";

import { aesDecryptData, aesEncryptData } from "./aesUtils";

interface OtpSessionInfo {
  dn: string,
  sendEmaililTimestamp?: number,
}

async function getOptSession(key: string, f: FastifyInstance): Promise<OtpSessionInfo | undefined> {
  const redisUserInfoJSON = await f.redis.get(key);
  if (!redisUserInfoJSON) {
    return;
  }
  return JSON.parse(redisUserInfoJSON);
}

export async function renderLiquidFile(fileName: string, data: Record<string, string>): Promise<string> {
  const engine = new Liquid({
    root: path.resolve(__dirname, "views/"),
    extname: ".liquid",
  });
  return await engine.renderFile(fileName, data);
}

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
  await f.redis.set(otpSessionToken, JSON.stringify(userInfo), "EX", authConfig.otp!.ldap!.timeLimitMinutes * 60);
  const mailAttributeName = ldapConfig.attrs.mail || "mail";
  const emailAddressInfo =
    await searchOneAttributeValueFromLdap(userInfo.dn, logger, mailAttributeName, client);
  const encryptOtpSessionToken = await aesEncryptData(f, otpSessionToken);
  const timeLimitMinutes = authConfig.otp!.ldap!.timeLimitMinutes;
  await bindOtpHtml(false, req, res,
    { timeLimitMinutes: timeLimitMinutes, otpSessionToken: encryptOtpSessionToken,
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

  const decryptedOtpSessionToken = await aesDecryptData(f, otpSessionToken);
  const otpLdap = authConfig.otp!.ldap!;
  if (!decryptedOtpSessionToken) {
    // redis中没有iv和key，返回信息过期UI
    await bindOtpHtml(false, req, res,
      { timeLimitMinutes: otpLdap.timeLimitMinutes, tokenNotFound: true, backToLoginUrl: backToLoginUrl });
    return;
  }
  const otpSession = await getOptSession(decryptedOtpSessionToken, f);
  if (!otpSession) {
    // 信息过期
    await bindOtpHtml(false, req, res,
      { timeLimitMinutes: otpLdap.timeLimitMinutes, tokenNotFound: true, backToLoginUrl: backToLoginUrl });
    return;
  }

  const currentTimestamp = getAbsoluteUTCTimestamp();
  if (otpSession["sendEmaililTimestamp"] !== undefined) {
    // 获取邮件链接需间隔至少authConfig.otp!.ldap!.timeLimitMinutes秒
    const timeDiff = Math.floor(currentTimestamp / 1000 - otpSession["sendEmaililTimestamp"]);
    if (timeDiff < otpLdap.authenticationMethod.mail.sendEmailFrequencyLimitInSeconds) {
      await bindOtpHtml(
        false, req, res,
        { timeLimitMinutes: otpLdap.timeLimitMinutes, emailAddress: emailAddress,
          timeDiffNotEnough: otpLdap.authenticationMethod.mail.sendEmailFrequencyLimitInSeconds
           - timeDiff, otpSessionToken, backToLoginUrl: backToLoginUrl });
      return;
    }
  }
  otpSession["sendEmaililTimestamp"] = Math.floor(currentTimestamp / 1000);

  const ttl = await f.redis.ttl(decryptedOtpSessionToken);

  await f.redis.set(decryptedOtpSessionToken, JSON.stringify(otpSession), "EX", ttl);
  const transporter = nodemailer.createTransport({
    host: otpLdap.authenticationMethod.mail.mailTransportInfo.host,
    port: otpLdap.authenticationMethod.mail.mailTransportInfo.port,
    secure: otpLdap.authenticationMethod.mail.mailTransportInfo.secure,
    auth: {
      user: otpLdap.authenticationMethod.mail.mailTransportInfo.user,
      pass: otpLdap.authenticationMethod.mail.mailTransportInfo.password,
    },
  } as TransportOptions);
  const authUrl = new URL(otpLdap.authUrl);
  const href = url.format({
    protocol: authUrl.protocol,
    host: authUrl.host,
    pathname: "/otp/email/validation",
    query: {
      token: otpSessionToken,
      backToLoginUrl: backToLoginUrl,
    },
  });

  const mailOptions = {
    from: otpLdap.authenticationMethod.mail.from,
    to: emailAddress,
    subject: otpLdap.authenticationMethod.mail.subject,
    html: await renderLiquidFile("email", {
      href: href,
      title: otpLdap.authenticationMethod.mail.title,
      contentText: otpLdap.authenticationMethod.mail.contentText,
      labelText: otpLdap.authenticationMethod.mail.labelText,
    }),
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
    { timeLimitMinutes: otpLdap.timeLimitMinutes, sendSucceeded: success,
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
  if (authConfig.otp?.status === OtpStatusOptions.disabled || !authConfig.otp?.status) {
    return true;
  }
  if (!inputCode) {
    await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
    return false;
  }

  const time = getAbsoluteUTCTimestamp();
  const otpRemote = authConfig.otp.remote!;
  if (authConfig.otp.status === OtpStatusOptions.remote) {
    const result = await fetch(otpRemote.url, {
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
  const otpLdap = authConfig.otp.ldap!;
  const secretInfo = await searchOneAttributeValueFromLdap(
    userInfo.dn, logger, otpLdap.secretAttributeName, client);
  if (!secretInfo?.value) {
    logger.error("fail to find otp secret");
    await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
    return false;
  }
  const result = speakeasy.totp.verify({
    token: inputCode,
    time: time / 1000,
    encoding: "base32",
    secret: secretInfo.value,
    digits: otpLdap.digits,
    step: otpLdap.period,
    algorithm: otpLdap.algorithm,
  });
  if (result) {
    return true;
  } else {
    await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
    return false;
  }
}

