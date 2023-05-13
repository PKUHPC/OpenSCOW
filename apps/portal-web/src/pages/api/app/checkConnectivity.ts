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

import { join } from "path";
import { authenticate } from "src/auth/server";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export interface CheckAppConnectivitySchema {
  method: "GET";

  query: {
    cluster: string;
    host: string;
    port: number;
  };

  responses: {
    200: { ok: boolean; }
  }
}

const auth = authenticate(() => true);

const TIMEOUT_MS = 3000;

export default /* #__PURE__*/route<CheckAppConnectivitySchema>("CheckAppConnectivitySchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, host, port } = req.query;

  const proxyGateway = runtimeConfig.CLUSTERS_CONFIG[cluster].proxyGateway;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, TIMEOUT_MS);

  const targetUrl = proxyGateway
    ? proxyGateway.url + join(publicConfig.BASE_PATH, "/api/proxy", cluster, host, String(port))
    : `http://${host}:${port}`;

  try {

    const resp = await fetch(targetUrl, {
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);

    if (resp.status === 500) {
      const json = await resp.json();
      // If the port is listening to WS, it will return ECONNRESET
      // Otherwise, if the port is not listening, it will return ECONNREFUSED
      return { ok: json.code === "ECONNRESET" };
    }

    return { 200: { ok: true } };

  } catch {
    return { 200: { ok: false } };
  }


});
