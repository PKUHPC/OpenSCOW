import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";

export interface SetAsTenantAdminSchema {
    method: "PATCH";

    body: {
        userId: string;
    };
    
    responses: {
        204: null;
        409: { code: "ALREADY_INITIALIZED"; }
    };
}