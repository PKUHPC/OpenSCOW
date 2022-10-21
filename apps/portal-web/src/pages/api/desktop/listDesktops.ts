import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { DesktopServiceClient } from "src/generated/portal/desktop";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";
import { route } from "src/utils/route";

export interface ListDesktopsSchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: {
      node: string;
      displayId: number[];
    };

    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<ListDesktopsSchema>("ListDesktopsSchema", async (req, res) => {



  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "listDesktops", {
    cluster, userId: info.identityId,
  }).then(async ({ node, displayIds }) => ({ 200: { node: await dnsResolve(node), displayId: displayIds } }));



});
