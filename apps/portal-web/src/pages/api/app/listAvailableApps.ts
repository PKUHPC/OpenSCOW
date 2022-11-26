import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { App, AppServiceClient } from "src/generated/portal/app";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface ListAvailableAppsSchema {
  method: "GET";

  query: {}

  responses: {
    200: {
      apps: App[];
    };
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<ListAvailableAppsSchema>("ListAvailableAppsSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "listAvailableApps", {}).then((reply) => {
    return { 200: { apps: reply.apps } };
  });

});
