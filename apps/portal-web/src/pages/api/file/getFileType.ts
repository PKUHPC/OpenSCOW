import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { FileServiceClient } from "src/generated/portal/file";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface GetFileTypeSchema {
    method: "GET";

    query: {
      cluster: string;
      path: string;
    };

    responses: {
      200: { type: string };
      400: { code: "INVALID_CLUSTER" | "INVALID_PATH" };
    };
}

const auth = authenticate(() => true);

export default route<GetFileTypeSchema>("GetFileTypeSchema", async (req, res) => {
  
  const info = await auth(req, res);
  
  if (!info) { return; }
  
  const { cluster, path } = req.query;
  
  const client = getClient(FileServiceClient);
  
  return asyncUnaryCall(client, "getFileMetadata", {
    userId: info.identityId, cluster, path,
  }).then((results) => ({ 200: { type: results.type } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
    [status.PERMISSION_DENIED]: () => ({ 400: { code: "INVALID_PATH" as const } }),
  }));
  
});