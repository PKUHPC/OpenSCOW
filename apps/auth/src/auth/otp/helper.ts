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
import { bindOTPHtml } from "src/auth/bindOTPHtml";
import { extractAttr, takeOne } from "src/auth/ldap/helpers";
import { serveLoginHtml } from "src/auth/loginHtml";
import { authConfig, AuthConfigSchema, LdapConfigSchema, OTPStatusOptions } from "src/config/auth";
import * as url from "url";

import { aesDecryptData, aesEncryptData } from "./aesUtils";

export async function storeOTPSessionAndGoSendEmailUI(
  f: FastifyInstance,
  req: FastifyRequest,
  res: FastifyReply,
  ldapConfig: LdapConfigSchema,
  logger: FastifyBaseLogger,
  client: ldapjs.Client,
  backToLoginUrl: string,
  userInfo: {
    dn: string,
    password: string,
  },
) {
  const OTPSessionToken = crypto.randomUUID();
  const encryptOTPSessionToken = aesEncryptData(OTPSessionToken);
  f.redis.set(OTPSessionToken, JSON.stringify(userInfo), "EX", 600);
  const mailAttributeName = ldapConfig.attrs.mail || "mail";
  const emailAddress = await searchOneAttributeValueFromLdap(userInfo.dn, logger, mailAttributeName, client);
  await bindOTPHtml(false, req, res,
    { sendEmailUI: true, OTPSessionToken: encryptOTPSessionToken, emailAddress: emailAddress, backToLoginUrl });
  return;
}

export async function sendEmailAuthLink(
  f: FastifyInstance,
  OTPSessionToken: string,
  req: FastifyRequest,
  res: FastifyReply,
  logger: FastifyBaseLogger,
  emailAddress: string,
  backToLoginUrl: string,
) {
  const redisUserJSON = await f.redis.get(aesDecryptData(OTPSessionToken));
  if (!redisUserJSON) {
    // 信息过期
    await bindOTPHtml(false, req, res,
      { sendEmailUI: true, redisUserInfoExpiration: true,
        OTPSessionToken: OTPSessionToken, backToLoginUrl: backToLoginUrl });
    return;
  }

  const redisUserInfoObject = JSON.parse(redisUserJSON);
  const currentTimestamp = await getAbsoluteUTCTimestamp();
  if (redisUserInfoObject["senEmailTimestamp"] !== undefined) {
    // 获取邮件链接需间隔至少60秒
    const timeDiff = Math.floor(currentTimestamp / 1000 - redisUserInfoObject["senEmailTimestamp"]);
    if (timeDiff < 60) {
      await bindOTPHtml(
        false, req, res,
        { sendEmailUI: true, emailAddress: emailAddress,
          timeDiffNotEnough: 60 - timeDiff, OTPSessionToken, backToLoginUrl: backToLoginUrl });
      return;
    }
  }
  redisUserInfoObject["senEmailTimestamp"] = Math.floor(currentTimestamp / 1000);
  const ttl = await f.redis.ttl(aesDecryptData(OTPSessionToken));
  await f.redis.set(OTPSessionToken, JSON.stringify(redisUserInfoObject), "EX", ttl);
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
      token: OTPSessionToken,
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
  console.log("发邮件了");
  transporter.sendMail(mailOptions, (e) => {
    if (e) {
      logger.info("fail to send email", e);
      success = false;
    }
  });
  await bindOTPHtml(
    false, req, res,
    { sendEmailUI: true, sendSucceeded: success,
      emailAddress: emailAddress, OTPSessionToken: OTPSessionToken, backToLoginUrl: backToLoginUrl });
}

export const extractSecretFromEntry = (
  authConfig: AuthConfigSchema, entry: ldapjs.SearchEntry, log: FastifyBaseLogger,
) => {
  const secret = takeOne(extractAttr(entry, authConfig.otp.secretAttributeName));

  if (!secret) {
    log.info("Candidate user (dn %s) doesn't has property key %s (set by otp.secretAttributeName)");
    return undefined;
  }

  return { secret };
};

export const extractEmailAddressFromEntry = (
  config: LdapConfigSchema, entry: ldapjs.SearchEntry, log: FastifyBaseLogger,
) => {
  const emailAddress = takeOne(extractAttr(entry, config.attrs.mail || "mail"));

  if (!emailAddress) {
    log.info("Candidate user (dn %s) doesn't has property key %s (set by ldap.attrs.mail). Ignored.");
    return undefined;
  }

  return { emailAddress };
};

export const extractUserInfoFromEntry = (
  config: LdapConfigSchema, entry: ldapjs.SearchEntry, log: FastifyBaseLogger,
) => {
  const identityId = takeOne(extractAttr(entry, config.attrs.uid));

  if (!identityId) {
    log.info("Candidate user (dn %s) doesn't has property key %s (set by ldap.attrs.uid). Ignored.");
    return undefined;
  }

  const name = config.attrs.name ? takeOne(extractAttr(entry, config.attrs.name)) : identityId;

  const emailAddress = takeOne(extractAttr(entry, config.attrs.mail || "mail"));

  return { identityId, name, emailAddress };
};


export async function getAbsoluteUTCTimestamp() {
  const currentTime = new Date();
  return Date.UTC(currentTime.getUTCFullYear(), currentTime.getUTCMonth(), currentTime.getUTCDate(),
    currentTime.getUTCHours(), currentTime.getUTCMinutes(), currentTime.getUTCSeconds(),
    currentTime.getUTCMilliseconds());
}
// 用于查找secret和mail
export async function searchOneAttributeValueFromLdap(
  dn: string, logger: FastifyBaseLogger, attributeName: string, client: ldapjs.Client): Promise<string | undefined > {
  return new Promise<string | undefined >((resolve, reject) => {
    client.search(dn, {
      scope: "sub",
      filter: "(objectclass=*)",
      attributes: [attributeName],
    }, (err, searchRes) => {
      if (err) {
        logger.error(`error in search attribute type ${attributeName}, dn: ${dn}`);
        reject(err);
      }

      searchRes.on("error", (error) => {
        logger.error(`error in search attribute type ${attributeName}, dn: ${dn}`);
        reject(error);
      });
      let found = false;
      searchRes.on("searchEntry", (entry) => {
        if (found) {
          logger.info("An entry has already be found. Ignoring more entities.");
          found = true;
          return;
        }
        const attributeValue = entry.object[attributeName];
        if (Array.isArray(attributeValue)) {
          resolve(attributeValue[0]);
        }
        else {
          resolve(attributeValue);
        }
      });
      searchRes.on("end", (result) => {
        logger.info("Received end event. %o", result);
        if (result?.status === 0) {
          resolve(undefined);
        } else {
          reject(result?.errorMessage);
        }
      });
    });
  });

}

interface UserInfo {
  userId: string,
  dn: string,
}

export async function validateOTPCode(
  userInfo: UserInfo,
  inputCode: string,
  callbackUrl: string,
  req: FastifyRequest,
  res: FastifyReply,
  logger: FastifyBaseLogger,
  client: ldapjs.Client,
) {
  if (authConfig.otp.status === OTPStatusOptions.disabled) {
    return true;
  }

  console.log("jjjj", authConfig.otp.status);
  console.log("jjjj", authConfig.otp.status);
  console.log("jjjj", authConfig.otp.status);
  console.log("jjjj", authConfig.otp.status);
  console.log("jjjj", authConfig.otp.status);
  console.log("jjjj", authConfig.otp.status);
  const time = await getAbsoluteUTCTimestamp();

  if (authConfig.otp.status === OTPStatusOptions.remote) {
    if (!authConfig.otp.remote.url || !authConfig.otp.remote.url)
    {
      logger.info("otp.remoteConfig.validateCodeUrl is undefined");
      return undefined;
    }

    const result = await fetch(authConfig.otp.remote.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        OTPCode: inputCode,
        userId: userInfo.userId,
      }),
    }).then(async (isValid) => {
      const res = await isValid.text();
      if (res === "true") {
        return true;
      }
      return false;
    })
      .catch((e) => {
        logger.error(`error in verify OTP code in remote status, error ${e}`);
        return false;
      });

    if (result) {
      return true;
    } else {
      await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
    }

  }
  // 如果是otp.status是local
  const secret = await searchOneAttributeValueFromLdap(userInfo.dn, logger, authConfig.otp.secretAttributeName, client);
  if (!secret) {
    await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
    return;
  }
  const result = speakeasy.totp.verify({
    token: inputCode,
    time: time / 1000,
    encoding: "base32",
    secret: secret,
    digits: authConfig.otp.digits,
    step: authConfig.otp.period,
    algorithm: authConfig.otp.algorithm,
  });
  if (result) {
    return true;
  } else {
    await serveLoginHtml(false, callbackUrl, req, res, undefined, true);
  }
}

