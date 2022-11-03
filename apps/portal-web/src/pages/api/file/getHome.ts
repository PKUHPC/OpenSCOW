import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { FileServiceClient } from "src/generated/portal/file";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface GetHomeDirectorySchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: { path: string };
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<GetHomeDirectorySchema>("GetHomeDirectorySchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(FileServiceClient);

  return asyncUnaryCall(client, "getHomeDirectory", {
    cluster, userId: info.identityId,
  }).then(({ path }) => ({ 200: { path } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
  }));


});
