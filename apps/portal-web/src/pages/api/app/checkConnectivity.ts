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

import { typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { runtimeConfig } from "src/utils/config";
import { isPortReachable } from "src/utils/isPortReachable";

export const CheckAppConnectivitySchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    host: Type.String(),
    port: Type.Number(),
  }),

  responses: {
    200: Type.Object({ ok: Type.Boolean() }),
  },
});

const auth = authenticate(() => true);

const TIMEOUT_MS = 3000;

export default /* #__PURE__*/typeboxRoute(CheckAppConnectivitySchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { host, port, cluster } = req.query;

  // TODO ignore proxy gateway
  const proxyGateway = runtimeConfig.CLUSTERS_CONFIG[cluster].proxyGateway;

  if (proxyGateway) {
    return { 200: { ok: true } };
  }

  const reachable = await isPortReachable(port, host, TIMEOUT_MS);

  return { 200: { ok: reachable } };
});
