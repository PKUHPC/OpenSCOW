import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { ListDesktopsReply, VncServiceClient  } from "src/generated/portal/vnc";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

export interface ListDesktopsSchema {
  method: "POST";

  body: {
    clusters: string[];
  }

  responses: {
    200: {
        result : ListDesktopsReply;
    };
    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /*#__PURE__*/route<ListDesktopsSchema>("ListDesktopsSchema", async (req, res) => {

  if (!publicConfig.ENABLE_VNC) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getJobServerClient(VncServiceClient);

  return await asyncClientCall(client, "listDesktops", {
    clusters: req.body.clusters,
    username: info.identityId,
  })
    .then((result) => {
      return { 200: { result } };
    });
});
