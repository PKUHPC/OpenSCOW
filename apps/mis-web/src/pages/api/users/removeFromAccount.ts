import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { UserServiceClient } from "src/generated/server/user";
import { PlatformRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface RemoveUserFromAccountSchema {
  method: "DELETE";

  body: {
    accountName: string;
    identityId: string;
  }

  responses: {
    204: null;
    // 用户不存在
    404: null;

    // 不能移出账户拥有者
    406: null;
  }
}

export default /*#__PURE__*/route<RemoveUserFromAccountSchema>("RemoveUserFromAccountSchema", async (req, res) => {
  const { identityId, accountName } = req.body;

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.find((x) => x.accountName === accountName)?.role !== UserRole.USER);

  const info = await auth(req, res);

  if (!info) { return; }

  // call ua service to add user
  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "removeUserFromAccount", {
    tenantName: info.tenant,
    accountName,
    userId: identityId,
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
      [Status.OUT_OF_RANGE]: () => ({ 406: null }),
    }));
});
