import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { ChargingServiceClient } from "src/generated/server/charging";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetUsedPayTypesSchema {
  method: "GET";

  responses: {
    200: {
      types: string[];
    }
  }
}

const auth = authenticate((u) =>
  u.tenantRoles.includes(TenantRole.TENANT_FINANCE),
);

export default route<GetUsedPayTypesSchema>("GetUsedPayTypesSchema",
  async (req, res) => {


    const info = await auth(req, res);

    if (!info) { return; }

    const client = getClient(ChargingServiceClient);

    const { types } = await asyncClientCall(client, "getAllPayTypes", {});

    return { 200: { types } };

  });

