import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { AccountServiceClient } from "src/generated/server/account";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCInternalError, internalErrorInfo } from "src/utils/internalError";
import { handlegRPCError } from "src/utils/server";

export interface DewhitelistAccountSchema {
  method: "DELETE";

  body: {
    accountName: string;
  }

  responses: {
    204: null;
    404: null;
    500: internalErrorInfo;
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<DewhitelistAccountSchema>("DewhitelistAccountSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const { accountName } = req.body;

    const client = getClient(AccountServiceClient);

    return await asyncClientCall(client, "dewhitelistAccount", {
      tenantName: info.tenant,
      accountName,
    })
      .then(() => ({ 204: null }))
      .catch(handlegRPCError({
        [Status.INTERNAL]: handlegRPCInternalError,
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
