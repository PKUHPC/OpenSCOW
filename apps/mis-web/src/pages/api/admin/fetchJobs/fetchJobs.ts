import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { AdminServiceClient } from "src/generated/server/admin";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface FetchJobsSchema {
  method: "POST";

  responses: {
    200: { newJobsCount: number }
  }
}
const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route<FetchJobsSchema>("FetchJobsSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const client = getClient(AdminServiceClient);

    const reply = await asyncClientCall(client, "fetchJobs", {});

    return { 200: { newJobsCount: reply.newJobsCount } };

  });
