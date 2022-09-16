import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";

export interface CompleteInitSchema {
  method: "POST";

  responses: {
    204: null;

    409: { code: "ALREADY_INITIALIZED"; }
  }
}

export default route<CompleteInitSchema>("CompleteInitSchema", async () => {
  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" } }; }

  const client = getClient(InitServiceClient);

  await asyncClientCall(client, "completeInit", {});

  return { 204: null };
});


