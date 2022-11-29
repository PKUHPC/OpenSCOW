import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

export interface userExistsSchema {
  method: "POST";

  body: {
    identityId: string;
  };

  responses: {
    200: { 
      existsInScow: boolean,
      existsInAuth: boolean | undefined,
    };
      
    // 204: null;

    400: { code: "USER_ID_NOT_VALID" };

  }
}

const userIdRegex = publicConfig.USERID_PATTERN ? new RegExp(publicConfig.USERID_PATTERN) : undefined;

export default route<userExistsSchema>("userExistsSchema", async (req) => {

  const { identityId } = req.body;

  if (userIdRegex && !userIdRegex.test(identityId)) {
    return { 400: {
      code: "USER_ID_NOT_VALID",
      message: `user id must match ${publicConfig.USERID_PATTERN}`,
    } };
  }


  const client = getClient(InitServiceClient);
  const result = await asyncClientCall(client, "userExists", {
    userId: identityId,
  });

  return {
    200:
    { 
      existsInScow: result.existsInScow,
      existsInAuth: result.existsInAuth,
    },
  };
});