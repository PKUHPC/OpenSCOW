import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { AdminServiceClient, GetClusterUsersReply } from "src/generated/server/admin";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";


export interface GetClusterUsersSchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: GetClusterUsersReply;
  }
}

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route<GetClusterUsersSchema>("GetClusterUsersSchema",
  async (req, res) => {

    // if not initialized, every one can import users
    if (await queryIfInitialized()) {
      const info = await auth(req, res);
      if (!info) { return; }
    }
    const { cluster } = req.query;

    const client = getClient(AdminServiceClient);

    const result = await asyncClientCall(client, "getClusterUsers", {
      cluster,
    });

    return {
      200: result,
    };
  });