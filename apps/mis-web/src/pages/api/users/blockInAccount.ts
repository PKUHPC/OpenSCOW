import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { UserServiceClient } from "src/generated/server/user";
import { PlatformRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface BlockUserInAccountSchema {
  method: "PUT";

  body: {
    accountName: string;
    identityId: string;
  }

  responses: {
    // 如果用户已经block，那么executed为false
    200: { executed: boolean };
    // 用户不存在
    404: null;
  }
}

export default /* #__PURE__*/route<BlockUserInAccountSchema>("BlockUserInAccountSchema", async (req, res) => {
  const { identityId, accountName } = req.body;

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.find((x) => x.accountName === accountName)?.role !== UserRole.USER);

  const info = await auth(req, res);

  if (!info) { return; }


  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "blockUserInAccount", {
    tenantName: info.tenant,
    accountName,
    userId: identityId,
  })
    .then(() => ({ 200: { executed: true } }))
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
      [Status.FAILED_PRECONDITION]: () => ({ 200: { executed: false } }),
    }));
});
