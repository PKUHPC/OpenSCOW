import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";

export interface SetAsInitAdminSchema {
  method: "PATCH";

  body: {
    userId: string;
  };

  responses: {
    204: null;

    409: { code: "ALREADY_INITIALIZED"; }

  }
}

export default route<SetAsInitAdminSchema>("SetAsInitAdminSchema", async (req) => {
  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" } }; }

  const { userId } = req.body;

  const client = getClient(InitServiceClient);

  await asyncClientCall(client, "setAsInitAdmin", {
    userId,
  });

  return { 204: null };

});

