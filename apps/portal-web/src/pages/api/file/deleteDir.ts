import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { FileServiceClient } from "src/generated/portal/file";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface DeleteDirSchema {
  method: "DELETE";

  body: {
    cluster: string;
    path: string;
  }

  responses: {
    204: null;
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<DeleteDirSchema>("DeleteDirSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, path } = req.body;

  const client = getClient(FileServiceClient);

  return asyncUnaryCall(client, "deleteDirectory", {
    cluster, path, userId: info.identityId,
  }).then(() => ({ 204: null }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
  }));



});
