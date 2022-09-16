import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { USE_MOCK } from "src/apis/useMock";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";

export async function queryIfInitialized() {
  if (USE_MOCK) { return false; }

  const client = getClient(InitServiceClient);

  const { initialized } = await asyncClientCall(client, "querySystemInitialized", {});

  return initialized;

}


