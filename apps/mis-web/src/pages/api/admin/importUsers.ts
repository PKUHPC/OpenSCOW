import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { AdminServiceClient } from "src/generated/server/admin";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface ImportUsersSchema {
  method: "POST";

  body: {
    data: string;
    whitelist: boolean;
  }

  responses: {
    204: null;
    400: { code: "INVALID_DATA" };
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<ImportUsersSchema>("ImportUsersSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

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
