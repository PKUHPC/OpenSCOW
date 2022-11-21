import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { AccountServiceClient } from "src/generated/server/account";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handleGrpcClusteropsError, InternalErrorInfo } from "src/utils/internalError";
import { handlegRPCError } from "src/utils/server";

export interface WhitelistAccountSchema {
  method: "PUT";

  body: {
    accountName: string;
    comment: string;
  }

  responses: {
    204: null;
    404: null;
    500: InternalErrorInfo;
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<WhitelistAccountSchema>("WhitelistAccountSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { accountName, comment } = req.body;

    const client = getClient(AccountServiceClient);

    return await asyncClientCall(client, "whitelistAccount", {
      tenantName: info.tenant,
      accountName,
      operatorId: info.identityId,
      comment,
    })
      .then(() => ({ 204: null }))
      .catch(handlegRPCError({
        [Status.INTERNAL]: handleGrpcClusteropsError,
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
