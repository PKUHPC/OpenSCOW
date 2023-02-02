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
import { sshConnectByPassword } from "@scow/lib-ssh";
import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { cacheInfo } from "src/auth/cacheInfo";
import { serveLoginHtml } from "src/auth/loginHtml";
import { redirectToWeb } from "src/routes/callback";
import { verifyCode } from "src/utils/vertifyCode";

export function registerPostHandler(f: FastifyInstance, loginNode: string) {

  f.register(formBody);

  const bodySchema = Type.Object({
    username: Type.String(),
    password: Type.String(),
    callbackUrl: Type.String(),
  });

  // register a login handler
  f.post<{ Body: Static<typeof bodySchema> }>("/public/auth", {
    schema: { body: bodySchema },
  }, async (req, res) => {
    const { username, password, callbackUrl } = req.body;

    const logger = req.log.child({ plugin: "ssh" });

    if (!verifyCode(f)) {
      await serveLoginHtml(true, callbackUrl, req, res, f, true);
      return;
    }

    // login to the a login node

    await sshConnectByPassword(loginNode, username, password, req.log, async () => {})
      .then(async () => {
        logger.info("Log in as %s succeeded.");
        const info = await cacheInfo(username, req);
        await redirectToWeb(callbackUrl, info, res);
      })
      .catch(async (e) => {
        logger.error(e, "Log in as %s failed.", username);
        await serveLoginHtml(true, callbackUrl, req, res, f);
      });

  });
}
