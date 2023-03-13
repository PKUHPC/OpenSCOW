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
import { status } from "@grpc/grpc-js";
import { DesktopServiceClient } from "@scow/protos/build/portal/desktop";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface CreateDesktopSchema {
  method: "POST";

  body: {
    cluster: string;

    // the name of the wm
    wm: string;
  }

  responses: {
    200: {
      host: string;
      port: number;
      password: string;
    };

    400: {
      code: "INVALID_WM" | "INVALID_CLUSTER";
    }

    409: {
      code: "TOO_MANY_DESKTOPS";
    }

    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<CreateDesktopSchema>("CreateDesktopSchema", async (req, res) => {

  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, wm } = req.body;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "createDesktop", {
    cluster, userId: info.identityId, wm,
  }).then(
    async ({ host, password, port }) => ({
      200: { host, password, port },
    }),
    handlegRPCError({
      [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
      [status.INVALID_ARGUMENT]: () => ({ 400: { code: "INVALID_WM" as const } }),
      [status.RESOURCE_EXHAUSTED]: () => ({ 409: { code: "TOO_MANY_DESKTOPS" as const } }),
    }));


});
