import { asyncRequestStreamCall } from "@ddadaal/tsgrpc-client";
import busboy, { BusboyEvents } from "busboy";
import { once } from "events";
import { authenticate } from "src/auth/server";
import { FileServiceClient } from "src/generated/portal/file";
import { getClient } from "src/utils/client";
import { pipeline } from "src/utils/pipeline";
import { route } from "src/utils/route";

export interface UploadFileSchema {
  method: "POST";

  query: {
    cluster: string;
    path: string;
  }

  responses: {
    204: null;
    400: { code: "INVALID_CLUSTER" }
  }
}

const auth = authenticate(() => true);

export default route<UploadFileSchema>("UploadFileSchema", async (req, res) => {

  const { cluster, path } = req.query;

  const info = await auth(req, res);

  if (!info) { return; }

  const bb = busboy({ headers: req.headers });

  const client = getClient(FileServiceClient);

  return await asyncRequestStreamCall(client, "upload", async ({ writeAsync }, stream) => {
    await writeAsync({ message: { $case: "info", info: { cluster, path, userId: info.identityId } } });

    const [_name, file] = (await once(bb, "file")) as Parameters<BusboyEvents["file"]>;

    await pipeline(
      file,
      (chunk) => ({ message: { $case: "chunk" as const, chunk } }),
      stream,
    );

  }).then(() => ({ 204: null }), (e) => {
    throw new Error("Error when writing stream", { cause: e });
  }).finally(() => {
    bb.end();
  });
});

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
