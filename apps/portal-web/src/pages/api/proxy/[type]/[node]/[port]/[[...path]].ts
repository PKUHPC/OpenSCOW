import http from "http";
import { NextApiRequest } from "next";
import { checkCookie } from "src/auth/server";
import { parseProxyTarget, proxy } from "src/server/proxy";
import { AugmentedNextApiResponse } from "src/types/next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: AugmentedNextApiResponse) => {

  if (!res.socket.server.upgrade) {
    // @ts-ignore
    const server: http.Server = req.socket.server;

    server.on("upgrade", async (req, socket, head) => {

      const writeError = (statusLine: string, msg: string) => {
        socket.end(`HTTP/1.1 ${statusLine}\r\n${msg}`);
      };

      const user = await checkCookie(() => true, req).catch(() => {
        writeError("500 Internal Server Error", "Error when authenticating request");
        return 500;
      });

      if (typeof user === "number") {
        writeError("401 Unauthorized", "token is not valid");
        return;
      }

      const url = req.url!;

      const target = parseProxyTarget(url);

      if (target instanceof Error) {
        writeError("400 Bad Request", target.message);
        return;
      }

      proxy.ws(req, socket, head, { target, ignorePath: true, xfwd: true }, (err) => {
        console.error(err, "Error when proxing WS requests");
        writeError("500 Internal Server Error", "Error when proxing WS requests");
      });

    });

    res.socket.server.upgrade = true;
    // reload the page at first call
    return res.redirect(307, req.url!);
  }

  const user = await checkCookie(() => true, req).catch(() => {
    res.status(500).send("Error when authenticating request");
    return 500;
  });

  if (typeof user === "number") {
    res.status(401).send("Unauthorized");
    return;
  }

  const target = parseProxyTarget(req.url!);

  if (target instanceof Error) {
    res.status(400).send(target.message);
    return;
  }

  console.log("proxy to %s", target);

  proxy.web(req, res, {
    target,
    ignorePath: true, xfwd: true,
  }, (err) => {
    if (err) {
      console.error(err, "Error when proxing requests");
      res.status(500).send(err);
    }
  });


};
