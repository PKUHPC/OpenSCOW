import { validateToken } from "@scow/lib-auth";
import cookie from "cookie";
import http, { IncomingMessage } from "http";
import httpProxy, { ProxyTarget } from "http-proxy";
import pino, { Logger } from "pino";
import { basePaths, config } from "src/config/env";
import { createReqIdGen } from "src/reqId";

const rootLogger = pino({ level: config.LOG_LEVEL });

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

function parseTarget(req: IncomingMessage): ProxyTarget | Error {
  // /base_path/proxy/{absolute,relative}/{node}/{port}/{path}
  if (!req.url) { return new Error("req.url is undefined"); }

  const parts = req.url.split("/");

  // find the end of base_path
  const proxyIndex = parts.indexOf("proxy");
  if (proxyIndex === -1) { return new Error("URL is malformed."); }

  const basePath = parts.slice(0, proxyIndex).join("/");

  const [_proxy, type, node, port, ...path] = parts.slice(proxyIndex);

  if (type === "absolute") {
    return `http://${node}:${port}/${basePath}/${path.join("/")}`;
  } else if (type === "relative") {
    return `http://${node}:${port}/${path.join("/")}`;
  } else {
    return new Error("type is not absolute or relative");
  }

}

export function createGateway() {
  const proxy = httpProxy.createServer();

  const reqIdGen = createReqIdGen();

  const server = http.createServer({}, (req, res) => {

    const logger = rootLogger.child({ req: reqIdGen() });

    function doProxy(target: ProxyTarget, type: string) {
      logger.info("proxy %s requests", type);
      proxy.web(req, res, { target }, (err) => {
        if (err) { logger.error(err, "Error when proxing %s requests", type); }
      });
    }

    if (!req.url) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("No url is specified");
      return;
    }

    // proxy auth requests
    if (req.url.startsWith(basePaths.authPublic)) {
      doProxy(config.AUTH_INTERNAL_URL, "auth");
      return;
    }

    // proxy PORTAL_BASE_PATH
    if (basePaths.portal && req.url.startsWith(basePaths.portal)) {
      logger.info("proxy portal requests");
      doProxy(config.PORTAL_INTERNAL_URL, "portal");
      return;
    }

    // proxy MIS_BASE_PATH
    if (basePaths.mis && req.url.startsWith(basePaths.mis)) {
      logger.info("proxy MIS requests");
      doProxy(config.PORTAL_INTERNAL_URL, "mis");
      return;
    }

    // the rest is proxy
    const target = parseTarget(req);

    if (target instanceof Error) {
      logger.error(target, "req.url is not parsable");
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("req.url is not parsable. " + target.message);
      return;
    }

    authenticate(req, logger).then((user) => {
      if (user) {
        logger.info("Authenticated as %s", user.identityId);
        doProxy(target, "proxy");
      } else {
        logger.info("Request not authenticated");
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end("Unauthorized");
      }
    });

  });

  server.on("upgrade", (req, socket, head) => {

    const logger = rootLogger.child({ req: reqIdGen() });

    const writeError = (statusLine: string, msg: string) => {
      socket.end(`HTTP/1.1 ${statusLine}\r\n${msg}`);
    };

    const doProxy = (target: ProxyTarget) => {
      logger.info("proxy ws requests");
      proxy.ws(req, socket, head, { target }, (err) => {
        if (err) {
          logger.error(err, "Error when proxing ws requests");
          writeError("500 Internal Server Error", "Error when proxing ws requests. " + err.message);
        }
      });
    };

    if (!req.url) {
      writeError("400 Bad Request", "No url is specified");
      return;
    }

    // proxy PORTAL_BASE_PATH
    if (basePaths.portal && req.url.startsWith(basePaths.portal)) {
      logger.info("proxy portal requests");
      doProxy(config.PORTAL_INTERNAL_URL);
      return;
    }

    // proxy MIS_BASE_PATH
    if (basePaths.mis && req.url.startsWith(basePaths.mis)) {
      logger.info("proxy MIS requests");
      doProxy(config.PORTAL_INTERNAL_URL);
      return;
    }

    // proxy
    const target = parseTarget(req);

    if (target instanceof Error) {
      logger.error(target, "req.url is not parsable");
      writeError("400 Bad Request", "req.url is not parsable. " + target.message);
      return;
    }

    authenticate(req, logger).then((user) => {
      if (user) {
        logger.info("Authenticated as {}. Continue WebSocket proxy to {}", user.identityId, target);
        doProxy(target);
      } else {
        logger.info("Request not authenticated");
        writeError("401 Unauthorized", "Token is not valid");
      }
    });
  });

  return server;
}

export async function startListening(server: http.Server) {
  return new Promise<void>((res) => {
    server.listen(config.PORT, config.HOST, () => {
      res();
    });
  });
}
