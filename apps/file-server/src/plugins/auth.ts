import cookie from "@fastify/cookie";
import { parsePlaceholder } from "@scow/config";
import { validateToken } from "@scow/lib-auth";
import fp from "fastify-plugin";
import { config, TOKEN_COOKIE_HEADER } from "src/config/env";

export interface UserInfo {
  identityId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user: UserInfo & { getHomeDir: () => string; };
  }
}

export const authPlugin = fp(async (f) => {

  f.register(cookie, { });


  f.decorateRequest("user", undefined);

  f.addHook("preValidation", async (req, rep) => {
    const token = req.cookies[TOKEN_COOKIE_HEADER];

    if (!token) {
      return rep.code(401).send(undefined);
    }

    const resp = await validateToken(config.AUTH_URL, token, req.log);

    if (!resp) {
      return rep.code(403).send();
    }

    req.user = {
      identityId: resp.identityId,
      getHomeDir: () => parsePlaceholder(config.USER_HOME, { userId: resp.identityId }),
    };
  });

});
