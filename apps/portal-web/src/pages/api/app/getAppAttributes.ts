import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { AppServiceClient } from "src/generated/portal/app";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export type AppCustomFormAttribute = {
  widget: string;
  label: string;
}

export interface GetAppAttributesSchema {
  method: "GET";

  query: {
    appId: string;
  }

  responses: {
    200: {
      appCustomFormAttributes: AppCustomFormAttribute[];
    };
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<GetAppAttributesSchema>("GetAppAttributesSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { appId } = req.query;

  const client = getClient(AppServiceClient);

  // const tmp_data: AppCustomFormAttribute[] = [
  //   { widget: "111", label: "222" },
  //   { widget: "333", label: "444" },
  // ];

  return asyncUnaryCall(client, "getAppAttributes", {
    appId,
  }).then((reply) => {
    return { 200: { appCustomFormAttributes: reply.attributes } };
  });

});
