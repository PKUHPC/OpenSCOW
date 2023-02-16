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

import formBody from "@fastify/formbody";
import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { cacheInfo } from "src/auth/cacheInfo";
import { findUser, useLdap } from "src/auth/ldap/helpers";
import { serveLoginHtml } from "src/auth/loginHtml";
import { authConfig, LdapConfigSchema } from "src/config/auth";
import { redirectToWeb } from "src/routes/callback";
import { verifyCaptcha } from "src/utils/verifyCaptcha";

export function registerPostHandler(f: FastifyInstance, ldapConfig: LdapConfigSchema) {

  f.register(formBody);

  const { captcha } = authConfig;

  const bodySchema = Type.Object({
    username: Type.String(),
    password: Type.String(),
    callbackUrl: Type.String(),
    token: Type.String(),
    code: Type.String(),
  });

  // register a login handler
  f.post<{ Body: Static<typeof bodySchema> }>("/public/auth", {
    schema: { body: bodySchema },
  }, async (req, res) => {
    const { username, password, callbackUrl, token, code } = req.body;

    if (captcha.enabled) {
      const result = await verifyCaptcha(f, code, token, callbackUrl, req, res);
      if (!result) {
        return;
      }
    }

    // TODO
    // 1. bind with the server
    // 2. find the user using username
    // 3. try binding the server with dn and password. if successful, the user is found.
    // 4. generate a token to represent the login
    // 5. set the token and user info to token
    // 6. redirect to /public/callback
    const logger = req.log.child({ plugin: "ldap" });

    await useLdap(logger, ldapConfig)(async (client) => {

      const user = await findUser(logger, ldapConfig, client, username);

      if (!user) {
        logger.info("Didn't find user with %s=%s", ldapConfig.attrs.uid, username);
        await serveLoginHtml(true, callbackUrl, req, res, f);
        return;
      }

      logger.info("Trying binding as %s with credentials", user.dn);

      await useLdap(logger, ldapConfig, { dn: user.dn, password })(async () => {
        logger.info("Binding as %s successful. User info %o", user.dn, user);
        const info = await cacheInfo(user.identityId, req);
        await redirectToWeb(callbackUrl, info, res);
      }).catch(async (err) => {
        logger.info("Binding as %s failed. Err: %o", user.dn, err);
        await serveLoginHtml(true, callbackUrl, req, res, f);
      });

    });
  });
}
