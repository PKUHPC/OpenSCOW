import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { AdminServiceClient } from "src/generated/server/admin";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface SetFetchStateSchema {
  method: "POST";

  query: {
    started: boolean;
  }

  responses: {
    204: null;
  }
}
const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route<SetFetchStateSchema>("SetFetchStateSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const client = getClient(AdminServiceClient);

    await asyncClientCall(client, "setFetchState", { started: req.query.started });

    return { 204: null };

  });
