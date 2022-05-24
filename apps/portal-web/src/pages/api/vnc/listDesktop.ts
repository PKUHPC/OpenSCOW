import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { ListDesktopReply,VncServiceClient  } from "src/generated/portal/vnc";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

export interface ListDesktopSchema {
  method: "POST";

  body: {
    clusters: string[];
  }

  responses: {
    200: {
        result : ListDesktopReply;
    };
    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /*#__PURE__*/route<ListDesktopSchema>("ListDesktopSchema", async (req, res) => {

  if (!publicConfig.ENABLE_VNC) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getJobServerClient(VncServiceClient);

  return await asyncClientCall(client, "listDesktop", {
    clusters: req.body.clusters,
    username: info.identityId,
  })
    .then((result) => {
      return { 200: { result } };
    });
});
