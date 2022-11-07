import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { TenantServiceClient } from "src/generated/server/tenant";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";
export interface CreateTenantSchema {
  method: "POST";

  body: {
    name: string;
  }

    responses: {
      204: null;
        
    /** 租户已经存在 */
      409: null;
  }
}

export default /* #__PURE__*/route<CreateTenantSchema>("CreateTenantSchema", async (req, res) => {

  const { name } = req.body;
  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

  const info = await auth(req, res);

  if (!info) { return; }

  // create tenant on server
  const client = getClient(TenantServiceClient);

  return await asyncClientCall(client, "createTenant", {
    name: name,
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [status.ALREADY_EXISTS]: () => ({ 409: null }),
    }));
});
