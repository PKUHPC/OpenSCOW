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

import { authenticate } from "src/auth/server";
import { runtimeConfig } from "src/utils/config";
import { isPortReachable } from "src/utils/port";
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

  const { host, port, cluster } = req.query;

  // TODO ignore proxy gatewya
  const proxyGateway = runtimeConfig.CLUSTERS_CONFIG[cluster].proxyGateway;

  if (proxyGateway) {
    return { 200: { ok: true } };
  }

  const reachable = await isPortReachable(port, host, TIMEOUT_MS);

  return { 200: { ok: reachable } };
});
