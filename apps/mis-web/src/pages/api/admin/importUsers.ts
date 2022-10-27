import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { AdminServiceClient, GetClusterUsersReply } from "src/generated/server/admin";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";
import { handlegRPCError } from "src/utils/server";

export interface ImportUsersSchema {
  method: "POST";

  body: {
    data: GetClusterUsersReply;
    whitelist: boolean;
  }

  responses: {
    204: null;
    400: { code: "INVALID_DATA" };
  }
}

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route<ImportUsersSchema>("ImportUsersSchema",
  async (req, res) => {

    // if not initialized, every one can import users
    if (await queryIfInitialized()) {
      const info = await auth(req, res);
      if (!info) { return; }
    }

    const { data, whitelist } = req.body;

    const client = getClient(AdminServiceClient);

    return await asyncClientCall(client, "importUsers", {
      data, whitelist,
    })
      .then(() => ({ 204: null }))
      .catch(handlegRPCError({
        [Status.INVALID_ARGUMENT]: () => ({ 400: { code: "INVALID_DATA" } } as const),
      }));
  });
