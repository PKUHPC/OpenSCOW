import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { validateToken } from "src/auth/token";
import { App, AppServiceClient } from "src/generated/portal/app";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface ListAvailableAppsSchema {
  method: "GET";

  query: {
    token: string;
  }

  responses: {
    200: {
      apps: App[];
    };

    403: null;
  }
}

// This API is called from server
// API call from server doesn't contain any cookie
// So the API cannot use authenticate way
//
// it's limitation from next-typed-api-routes
// Will be resolved after migrating to trpc
//
// For now, the API requires token from query
// and authenticate manually
export default /* #__PURE__*/route<ListAvailableAppsSchema>("ListAvailableAppsSchema", async (req) => {

  const { token } = req.query;

  const info = await validateToken(token);

  if (!info) { return { 403: null }; }

  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "listAvailableApps", {}).then((reply) => {
    return { 200: { apps: reply.apps } };
  });

});
