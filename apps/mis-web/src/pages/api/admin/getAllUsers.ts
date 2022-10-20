import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { GetAllUsersReply, UserServiceClient } from "src/generated/server/user";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetAllUsersSchema {
    method: "GET";

    query: {
      /**
       * @minimum 1
       * @type integer
       */
      page?: number;

      /**
       * @type integer
       */
      pageSize?: number;
    
    };
    
    responses: {
        200: GetAllUsersReply;
    }
}

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route<GetAllUsersSchema>("GetAllUsersSchema", 
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { page = 1, pageSize } = req.query;

    const client = getClient(UserServiceClient);
    const result = await asyncClientCall(client, "getAllUsers", {
      page,
      pageSize,
    });

    return {
      200: result,
    };
  });