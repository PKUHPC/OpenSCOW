import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { UserServiceClient } from "src/generated/server/user";
import { PlatformRole, TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";


export interface SetTenantRoleSchema {
  method: "PUT";

  body: {
    userId: string;
    roleType: TenantRole;
  }

  responses: {
    // 如果用户已经是这个角色，那么executed为false
    200: { executed: boolean };
    // 用户不存在
    404: null;
  }
}

export default route<SetTenantRoleSchema>("SetTenantRoleSchema", async (req, res) => {
  const { userId, roleType } = req.body;

  const auth = authenticate((u) => 
    u.tenantRoles.includes(TenantRole.TENANT_ADMIN));
  
  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "setTenantRole", {
    userId,
    roleType,
  })
    .then(() => ({ 200: { executed: true } }))
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
      [Status.FAILED_PRECONDITION]: () => ({ 200: { executed: false } }),
    }));
});