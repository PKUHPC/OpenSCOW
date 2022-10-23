import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { AdminServiceClient } from "src/generated/server/admin";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";


export interface GetClusterUsersSchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: {
      dataString: string;
    }
  }
}

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route<GetClusterUsersSchema>("GetClusterUsersSchema",
  async (req, res) => {
    const info = await auth(req, res);
    if (!info) { return; }

    const { cluster } = req.query;

    const client = getClient(AdminServiceClient);

    return await asyncClientCall(client, "getClusterUsers", {
      cluster,
    })
      .then(({ result }) => ({ 200: { dataString: result } }));
  });