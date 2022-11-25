import http from "http";
import httpProxy from "http-proxy";
import { join } from "path";
import pino from "pino";
import { authenticateRequest } from "src/auth";
import { config } from "src/config/env";
import { setupGracefulShutdown } from "src/gracefulShutdown";
import { longestMatch, stripPrefix } from "src/match";
import { createReqIdGen } from "src/reqId";
import { normalizeUrl } from "src/utils";

function emptyIfRoot(path: string) {
  return path === "/" ? "" : path;
}

const basePaths = {
  authPublic: join(config.BASE_PATH, "/auth/public"),
  portal: config.PORTAL_PATH ? join(config.BASE_PATH, emptyIfRoot(config.PORTAL_PATH)) : undefined,
  mis: config.MIS_PATH ? join(config.BASE_PATH, emptyIfRoot(config.MIS_PATH)) : undefined,
  proxy: join(config.BASE_PATH, "/proxy"),
};


const rootLogger = pino({ level: config.LOG_LEVEL });


function parseProxyTarget(url: string): string | Error {
  const parts = url.split("/");

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

interface Rule {
  prefix: string;
  proxy: () => void;
}

export function createGateway() {
  const proxy = httpProxy.createServer();

  const reqIdGen = createReqIdGen();

  const server = http.createServer({}, (req, res) => {

    const logger = rootLogger.child({ req: reqIdGen() });

    function doProxy(target: string, type: string, auth: boolean) {

      const proxyWeb = () => {
        proxy.web(req, res, {
          target,
          ignorePath: true, xfwd: true,
        }, (err) => {
          if (err) { logger.error(err, "Error when proxing %s requests", type); }
        });
      };

      logger.info("proxy %s request", type);

      if (!auth) {
        proxyWeb();
        return;
      }

      authenticateRequest(req, logger).then((user) => {
        if (user) {
          proxyWeb();
        } else {
          res.writeHead(401, { "Content-Type": "text/plain" });
          res.end("Unauthorized");
        }
      }, (e) => {
        logger.error(e, "Error when authenticating request");
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error during authentication");
      });
    }

    if (!req.url) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("No url is specified");
      return;
    }

    const url = normalizeUrl(req.url);

    const rules: Rule[] = [
      {
        prefix: basePaths.authPublic,
        proxy: () =>
          doProxy(config.AUTH_INTERNAL_URL + "/public" + stripPrefix(url, basePaths.authPublic), "auth", false),
      },
    ];

    if (basePaths.portal) {
      rules.push({
        prefix: basePaths.portal,
        proxy: () => doProxy(config.PORTAL_INTERNAL_URL + url, "portal", false),
      });
    }

    if (basePaths.mis) {
      rules.push({
        prefix: basePaths.mis,
        proxy: () => doProxy(config.MIS_INTERNAL_URL + url, "mis", false),
      });
    }


    rules.push({
      prefix: basePaths.proxy,
      proxy: () => {

        const target = parseProxyTarget(url);

        if (target instanceof Error) {
          logger.error(target, "req.url is not parsable");
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("req.url is not parsable. " + target.message);
          return;
        }

        doProxy(target, "proxy", true);
      },
    });

    const match = longestMatch(url, rules);

    if (match) {
      match.proxy();
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }

  });

  server.on("upgrade", (req, socket, head) => {

    const logger = rootLogger.child({ req: reqIdGen() });

    const writeError = (statusLine: string, msg: string) => {
      socket.end(`HTTP/1.1 ${statusLine}\r\n${msg}`);
    };

    function doProxy(target: string, type: string, auth: boolean) {

      const proxyWs = () => {
        proxy.ws(req, socket, head, {
          target, ignorePath: true, xfwd: true,
        }, (err) => {
          if (err) { logger.error(err, "Error when proxing %s requests", type); }
        });
      };

      logger.info("proxy %s WebSocket requests", type);

      if (!auth) {
        proxyWs();
        return;
      }

      authenticateRequest(req, logger).then((user) => {
        if (user) {
          proxyWs();
        } else {
          writeError("401 Unauthorized", "Unauthorized");
        }
      }, (e) => {
        logger.error(e, "Error when authenticating request");
        writeError("500 Internal Server Error", "Error when authenticating request");
      });
    }

    if (!req.url) {
      writeError("400 Bad Request", "No url is specified");
      return;
    }

    const url = normalizeUrl(req.url);

    const rules: Rule[] = [];

    if (basePaths.portal) {
      rules.push({
        prefix: basePaths.portal,
        proxy: () => doProxy(config.PORTAL_INTERNAL_URL + url, "portal", false),
      });
    }

    if (basePaths.mis) {
      rules.push({
        prefix: basePaths.mis,
        proxy: () => doProxy(config.MIS_INTERNAL_URL + url, "mis", false),
      });
    }

    rules.push({
      prefix: basePaths.proxy,
      proxy: () => {
        // proxy
        const target = parseProxyTarget(url);

        if (target instanceof Error) {
          logger.error(target, "req.url is not parsable");
          writeError("400 Bad Request", "req.url is not parsable. " + target.message);
          return;
        }

        doProxy(target, "proxy", true);
      },
    });

    const match = longestMatch(url, rules);

    if (match) {
      match.proxy();
      return;
    } else {
      writeError("404 Not Found", "Not found");
    }
  });

  return server;
}


export async function startListening(server: http.Server) {

  setupGracefulShutdown(server, rootLogger);

  // start
  return new Promise<void>((res) => {
    server.listen(config.PORT, config.HOST, () => {
      res();
    });
  });
}
