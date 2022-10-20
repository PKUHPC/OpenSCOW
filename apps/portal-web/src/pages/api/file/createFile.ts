import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { FileServiceClient } from "src/generated/portal/file";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface CreateFileSchema {
  method: "POST";

  body: {
    cluster: string;
    path: string;
  }

  responses: {
    204: null;
    409: { code: "ALREADY_EXISTS" }
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<CreateFileSchema>("CreateFileSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, path } = req.body;

  const client = getClient(FileServiceClient);

  return asyncUnaryCall(client, "createFile", {
    cluster, path, userId: info.identityId,
  }).then(() => ({ 204: null }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
    [status.ALREADY_EXISTS]: () => ({ 409: { code: "ALREADY_EXISTS" as const } }),
  }));

});
