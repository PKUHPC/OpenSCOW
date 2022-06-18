import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { VncServiceClient } from "src/generated/portal/vnc";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";

export interface CreateDesktopSchema {
  method: "POST";

  body: {
    cluster: string;

    // the name of the wm
    wm: string;
  }

  responses: {
    200: {
      node: string;
      port: number;
      password: string;
    };

    400: {
      code: "INVALID_WM";
      message: string;
    }

    409: {
      code: "RESOURCE_EXHAUSTED";
      message: string;
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

  const { cluster, wm } = req.body;

  if (publicConfig.LOGIN_DESKTOP_WMS[wm] === undefined) {
    return { 400: { code: "INVALID_WM", message: `${wm} is not a acceptable wm.` } };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getJobServerClient(VncServiceClient);

  return await asyncClientCall(client, "createDesktop", {
    cluster,
    username: info.identityId,
    wm: publicConfig.LOGIN_DESKTOP_WMS[wm],
  })
    .then(async ({ node, password, port }) => {
      return { 200: { node: await dnsResolve(node), password, port } };
    }).catch((e) => {
      if (e.code === status.RESOURCE_EXHAUSTED) {
        return { 409: { code: "RESOURCE_EXHAUSTED", message: e.details } } as const;
      } else {
        throw e;
      }
    });
});
