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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { DesktopServiceClient } from "@scow/protos/build/portal/desktop";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface LaunchDesktopSchema {
  method: "POST";

  body: {
    displayId: number;
    cluster: string;
  }

  responses: {
    200: {
      host: string;
      port: number;
      password: string;
    };
    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<LaunchDesktopSchema>("LaunchDesktopSchema", async (req, res) => {
  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, displayId } = req.body;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "connectToDesktop", {
    cluster, displayId, userId: info.identityId,
  }).then(async ({ host, password, port }) => ({ 200: {
    host,
    password,
    port,
  } }), handlegRPCError({

  }));
});
