/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { PlatformRole } from "@scow/protos/build/server/user";
import { joinWithUrl } from "@scow/utils";
import httpProxy from "http-proxy";
import { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "src/auth/server";
import { publicConfig } from "src/utils/config";
import { DEFAULT_GRAFANA_URL } from "src/utils/constants";

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
});

proxy.on("proxyReq", function(proxyReq, req) {
  if (req.body) {
    const bodyData = JSON.stringify(req.body);

    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

    if (req.headers.host) {
      proxyReq.setHeader("Host", req.headers.host);
    }

    proxyReq.write(bodyData);
  }
});

const auth = authenticate((info) =>
  info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if (!publicConfig.CLUSTER_MONITOR.resourceStatus.enabled) {
    return res.status(404).send("Resource status is not enabled");
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { path, ...rest } = req.query;

  const grafanaPath = path ? (Array.isArray(path) ? path.join("/") : path) : "/";

  const queryString = new URLSearchParams(rest as Record<string, string>).toString();
  const urlWithQuery = queryString ? `?${queryString}` : "";

  const grafanaUrl = publicConfig.CLUSTER_MONITOR.grafanaUrl ?? DEFAULT_GRAFANA_URL;
  const target = joinWithUrl(grafanaUrl, grafanaPath) + urlWithQuery;

  proxy.web(req, res, {
    target, xfwd: true,
    ignorePath: true,
  }, (err) => {
    if (err) {
      console.error(err, "Error when proxing requests");
      res.status(500).send(err);
    }
  });
};
