import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { AdminServiceClient } from "src/generated/server/admin";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface QueryStorageQuotaSchema {
  method: "GET";

  query: {
    cluster: string;
    userId: string;
  }

  responses: {
    200: {
      currentQuota: number;
    }

    404: null;
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<QueryStorageQuotaSchema>("QueryStorageQuotaSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const { userId, cluster } = req.query;

    const client = getClient(AdminServiceClient);

    return await asyncClientCall(client, "queryStorageQuota", {
      cluster,
      userId,
    })
      .then(({ currentQuota }) => ({ 200: { currentQuota } }))
      .catch(handlegRPCError({
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
