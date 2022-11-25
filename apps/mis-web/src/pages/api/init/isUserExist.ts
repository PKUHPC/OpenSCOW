import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

export interface IsUserExistSchema {
  method: "POST";

  body: {
    identityId: string;
    name: string;
    email: string;
    password: string
  };

  responses: {
    200: { 
      isExistInScow: boolean,
      isExistInLdap: boolean,
    };
      
    // 204: null;

    400: { code: "USER_ID_NOT_VALID" };

  }
}

const userIdRegex = publicConfig.USERID_PATTERN ? new RegExp(publicConfig.USERID_PATTERN) : undefined;

export default route<IsUserExistSchema>("IsUserExistSchema", async (req) => {

  const { email, identityId, name, password } = req.body;

  if (userIdRegex && !userIdRegex.test(identityId)) {
    return { 400: {
      code: "USER_ID_NOT_VALID",
      message: `user id must match ${publicConfig.USERID_PATTERN}`,
    } };
  }

  const client = getClient(InitServiceClient);
  const isExist = await asyncClientCall(client, "isUserExist", {
    email, name, userId: identityId, password,
  });

  return {
    200:
    { 
      isExistInScow: isExist["isExistInScow"],
      isExistInLdap: isExist["isExistInLdap"],
    },
  };
});