import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { AdminServiceClient, GetFetchInfoReply } from "src/generated/server/admin";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetFetchJobInfoSchema {
  method: "GET";

  responses: {
    200: GetFetchInfoReply;
  }
}
const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route<GetFetchJobInfoSchema>("GetFetchJobInfoSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const client = getClient(AdminServiceClient);

    const reply = await asyncClientCall(client, "getFetchInfo", {});

    return { 200: reply };

  });
