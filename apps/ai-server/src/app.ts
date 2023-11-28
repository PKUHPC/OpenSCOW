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

import { fastifyConnectPlugin } from "@bufbuild/connect-fastify";
import fastify from "fastify";
import { IncomingMessage } from "http";
import proxy from "http-proxy";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { services } from "src/services/index";
import { loggerOptions } from "src/utils/logger";

export async function startApp() {

  const server = fastify({
    http2: true,
    https: {
      allowHTTP1: true,
    },
    logger: loggerOptions,
  });

  const proxyServer = proxy.createProxyServer({});

  function parseProxyTarget(url: string): string {

    const [_empty, _proxy, _clusterId, _type, host, port, ...path] = url.split("/");

    // if type is relative, path is only relative path for the app, like /index.html
    // if type is absolute, path is the pathname shown in user's browser,
    //  like /proxy/${platformIdentityId}/absolute/182.2.3.1/8080/index.html
    //  which already includes base path,
    // so in both case, we should not prepend host or port, but pass path directly
    const target = `http://${host}:${port}/${path.join("/")}`;
    return target;
  }

  server.all("/proxy/*", {}, (req, res) => {
    const target = parseProxyTarget(req.url);
    req.log.debug("Parsed proxy target %s", target);

    // @ts-ignore
    proxyServer.web(req.raw, res.raw, {
      target, ignorePath: true, xfwd: true,
    });
  });

  server.server.on("upgrade", (req: IncomingMessage, socket, head) => {
    const url = req.url;
    if (!url) { throw new Error("req.url is undefined"); }

    if (!url.startsWith("/proxy/")) { return; }
    const target = parseProxyTarget(url);
    proxyServer.ws(req, socket, head, {
      target, ignorePath: true, xfwd: true,
    });
  });

  server.addContentTypeParser("*", function(req, payload, done) {
    done(null);
  });

  for (const plugin of plugins) {
    await server.register(plugin);
  }

  // const em =server.orm.em.fork();
  // await server.register(fastifyConnectPlugin, {
  //   routes: (router) => {
  //     services(router, em);}
  // });

  await server.register(fastifyConnectPlugin, {
    routes: services,
  });

  server.addHook("preHandler", async (request) => {
    const em = server.orm.em.fork();
    request.em = em;
  });

  await server.listen({ host: config.HOST, port: config.PORT });

}
