import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { OperationType } from "@scow/lib-operation-log";
import { FileServiceClient } from "@scow/protos/build/portal/file";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationResult } from "src/models/operationLog";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError, parseIp } from "src/utils/server";


export const DecompressFileSchema = typeboxRouteSchema({
  method: "POST",

  body: Type.Object({
    clusterId: Type.String(),
    filePath: Type.String(),
    decompressionPath: Type.String(),
  }),

  responses: {
    204: Type.Null(),
    403: Type.Object({ code: Type.Literal("PERMISSION_DENIED") }),
    409: Type.Object({ code: Type.Literal("UNIMPLEMENTED") }),
    400: Type.Object({ code: Type.Literal("INVALID_ARGUMENT") }),
    500: Type.Object({
      code: Type.Literal("INTERNAL"),
      // stderr of file decompression command
      error: Type.String(),
    }),
  },
});

const auth = authenticate(() => true);

export default route(DecompressFileSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { clusterId, filePath, decompressionPath } = req.body;

  const client = getClient(FileServiceClient);

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.decompressFile,
    operationTypePayload:{
      clusterId,
      filePath,
      decompressionPath,
    },
  };

  return await asyncUnaryCall(client, "decompressFile", {
    userId: info.identityId, clusterId, filePath, decompressionPath,
  }).then(async () => {
    await callLog(logInfo, OperationResult.SUCCESS);
    return { 204: null };
  }, handlegRPCError({
    [status.UNIMPLEMENTED]: () => ({ 409: { code: "UNIMPLEMENTED" as const } }),
    [status.INVALID_ARGUMENT]: () => ({ 400: { code: "INVALID_ARGUMENT" as const } }),
    [status.PERMISSION_DENIED]: () => ({ 403: { code: "PERMISSION_DENIED" as const } }),
    [status.INTERNAL]: (e) => ({ 500: { code: "INTERNAL" as const, error: e.details } }),
  },
  async () => await callLog(logInfo, OperationResult.FAIL),
  ));

});
