import formBody from "@fastify/formbody";
import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import ldapjs from "ldapjs";
import { cacheInfo } from "src/auth/cacheInfo";
import { findUser, useLdap } from "src/auth/ldap/helpers";
import { serveLoginHtml } from "src/auth/ldap/loginHtml";
import { config } from "src/config";
import { redirectToWeb } from "src/routes/callback";

export function registerPostHandler(f: FastifyInstance) {

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

    // TODO
    // 1. bind with the server
    // 2. find the user using username
    // 3. try binding the server with dn and password. if successful, the user is found.
    // 4. generate a token to represent the login
    // 5. set the token and user info to token
    // 6. redirect to /public/callback
    const logger = req.log.child({ plugin: "ldap" });

    await useLdap(logger)(async (client) => {

      const user = await findUser(logger, client, username);

      if (!user) {
        logger.info("Didn't find user with %s=%s", config.LDAP_ATTR_UID, username);
        await serveLoginHtml(true, callbackUrl, req, res);
        return;
      }

      logger.info("Trying binding as %s with credentials", user.dn);
      const anotherClient = ldapjs.createClient({ url: config.LDAP_URL, log: logger });

      const err = await new Promise<null | ldapjs.Error>((res) => {
        anotherClient.bind(user.dn, password, (err) => {
          res(err);
        });
      });

      if (err) {
        logger.info("Binding as %s failed. Err: %o", user.dn, err);
        await serveLoginHtml(true, callbackUrl, req, res);
        return;
      }

      logger.info("Binding as %s successful. User info %o", user.dn, user);

      const info = await cacheInfo(user.identityId, req);

      await redirectToWeb(callbackUrl, info, res);
    });
  });
}
