import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { FileServiceClient } from "src/generated/portal/file";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface ExistsSchema {
	method: "GET";
	
	body: {
		cluster: string;
		path: string;
	}

	responses: {
		200: { result: boolean };
		400: { code: "INVALID_CLUSTER" };
	}
}

const auth = authenticate(() => true);

export default route<ExistsSchema>("ExistsSchema", async (req, res) => {

  const info = await auth(req, res);
  if (!info) { return; }

  const { cluster, path } = req.body;

  const client = getClient(FileServiceClient);

  return asyncUnaryCall(client, "exists", {
    userId: info.identityId, cluster, path,  
  }).then((results) => ({ 200: { result: results.exists } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
  }));
});