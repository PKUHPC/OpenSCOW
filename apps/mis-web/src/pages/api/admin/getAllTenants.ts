import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { GetAllTenantsReply, TenantServiceClient } from "src/generated/server/tenant";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";
export interface GetAllTenantsSchema {
    method: "GET";
    responses: {
        200: GetAllTenantsReply;
    }
}
const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));
export default route<GetAllTenantsSchema>("GetAllTenantsSchema",
  async (req, res) => {
    const info = await auth(req, res);
    if (!info) {
      return;
    }
    // UserServiceClient
    const client = getClient(TenantServiceClient);
    const result = await asyncClientCall(client, "getAllTenants", {});
    return {
      200:result,
    };
  });
