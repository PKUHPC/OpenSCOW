import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { UserServiceClient } from "src/generated/server/user";
import { FullUserInfo, TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetAllPlatformUsersSchema {
  method: "GET";

  responses: {
    200: {
      results: FullUserInfo[];
    }
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<GetAllPlatformUsersSchema>("GetAllPlatformUsersSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const client = getClient(UserServiceClient);
    const { users } = await asyncClientCall(client, "getUsers", {
      tenantName: info.tenant,
    });

    // aggregate the result
    const combined: FullUserInfo[] = users.map((x) => ({
      accountAffiliations: x.accountAffiliations,
      createTime: x.createTime || "",
      email: x.email,
      id: x.userId,
      name: x.name,
      platformRoles: x.platformRoles,
    }));


    return { 200: { results: combined } };
  });
