import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { appCustomAttribute_AttributeTypeToJSON, AppServiceClient } from "src/generated/portal/app";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface SelectOption {
  value: string;
  label: string;
}

export interface AppCustomAttribute {
  type: string;
  label: string;
  name: string;
  select: SelectOption[];
}

export interface GetAppAttributesSchema {
  method: "GET";

  query: {
    appId: string;
  }

  responses: {
    200: {
      appCustomFormAttributes: AppCustomAttribute[];
    };

    // appId not exists
    404: { code: "APP_NOT_FOUND" };
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<GetAppAttributesSchema>("GetAppAttributesSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { appId } = req.query;

  const client = getClient(AppServiceClient);


  return asyncUnaryCall(client, "getAppAttributes", {
    appId,
  }).then((reply) => {
    const attributes: AppCustomAttribute[] = [];
    reply.attributes.forEach((item) => {
      attributes.push({
        type: appCustomAttribute_AttributeTypeToJSON(item.type),
        label: item.label,
        name: item.name,
        select: item.options,
      });
    });
    return { 200: { appCustomFormAttributes: attributes } };
  }, handlegRPCError({
    [status.NOT_FOUND]: () => ({ 404: { code: "APP_NOT_FOUND" } } as const),
  }));

});
