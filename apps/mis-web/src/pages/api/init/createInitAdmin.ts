import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";

export interface CreateInitAdminSchema {
  method: "POST";

  body: {
    /**
     * 用户ID
     * @pattern ^[a-z0-9_]+$
     */
    identityId: string;

    name: string;
    email: string;
  };

  responses: {
    204: null;

    409: { code: "ALREADY_INITIALIZED"; }

  }
}

export default route<CreateInitAdminSchema>("CreateInitAdminSchema", async (req) => {
  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" } }; }

  const { email, identityId, name } = req.body;

  const client = getClient(InitServiceClient);

  await asyncClientCall(client, "createInitAdmin", {
    email, name, userId: identityId,
  });

  return { 204: null };

});

