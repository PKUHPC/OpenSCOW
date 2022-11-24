import { validateToken } from "@scow/lib-auth";
import { UserInfo } from "@scow/lib-auth/build/validateToken";
import cookie from "cookie";
import { IncomingMessage } from "http";
import { Logger } from "pino";
import { config } from "src/config/env";

const TOKEN_COOKIE_KEY = "SCOW_USER";

function parseToken(req: IncomingMessage) {
  const token: string | undefined = cookie.parse(req.headers.cookie || "")[TOKEN_COOKIE_KEY];

  return token;
}

async function authenticate(req: IncomingMessage, logger: Logger) {
  const token = parseToken(req);

  const user = token && await validateToken(config.AUTH_INTERNAL_URL, token, logger);

  return user ? user : undefined;
}

export async function authenticateRequest(
  req: IncomingMessage,
  logger: Logger,
): Promise<UserInfo | undefined> {

  const user = await authenticate(req, logger);

  if (user) {
    logger.info("Authenticated as %s", user.identityId);
    return user;
  } else {
    return undefined;
  }
}

