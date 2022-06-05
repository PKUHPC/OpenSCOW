import { createProxyServer } from "http-proxy";
import { Socket } from "net";
import { NextApiRequest } from "next";
import { join } from "path";
import { Check } from "src/auth/requireAuth";
import { authenticate, checkCookie } from "src/auth/server";
import { NextApiResponseServerIO } from "src/types/socket";
import { queryToArray, queryToIntOrDefault, queryToString } from "src/utils/querystring";


export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const strategy: Check = () => true;

const auth = authenticate(strategy);

const STATUS_TEXT = {
  401: "Unauthorized",
  403: "Forbidden",
};

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.proxy) {
    const proxy = res.socket.server.proxy = createProxyServer({
      ignorePath: true,
    });

    res.socket.server.on("upgrade", async (req: NextApiRequest, socket: Socket, head) => {

      if (!req.url || !req.url.startsWith(join(process.env.NEXT_PUBLIC_BASE_PATH || "/", "api/proxy/"))) {
        return;
      }

      const user = await checkCookie(strategy, req);

      if (typeof user === "number") {
        socket.write(`HTTP/1.1 ${user} ${STATUS_TEXT[user]}`);
        socket.end();
        socket.destroy();
        return;
      }

      // manually extract proxy target
      const [_, _api, _proxy, host, port, ...path] = req.url.split("/");

      proxy.ws(req, socket, head, {
        target: { protocol: "ws:", host, port, path: "/" + path.join("/") },
      }, (err) => {
        console.log(err);
      });
    });

  }

  const info = await auth(req, res);

  if (!info) { return; }

  const host = queryToString(req.query.host);
  const port = queryToIntOrDefault(req.query.port, 0);
  const path = "/" + queryToArray(req.query.path).join("/");

  res.socket.server.proxy.web(req, res, {
    target: { protocol: "http:", host, port, path },
  }, (err) => {
    console.log(err);
    res.status(500).send(err);
  });

};
