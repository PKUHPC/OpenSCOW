import formBody from "@fastify/formbody";
import { sshConnectByPassword } from "@scow/lib-ssh";
import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { cacheInfo } from "src/auth/cacheInfo";
import { serveLoginHtml } from "src/auth/loginHtml";
import { redirectToWeb } from "src/routes/callback";

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

    // login to the a login node

    await sshConnectByPassword(loginNode, username, password, req.log, async () => {})
      .then(async () => {
        logger.info("Log in as %s succeeded.");
        const info = await cacheInfo(username, req);
        await redirectToWeb(callbackUrl, info, res);
      })
      .catch(async (e) => {
        logger.error(e, "Log in as %s failed.", username);
        await serveLoginHtml(true, callbackUrl, req, res);
      });

  });
}
