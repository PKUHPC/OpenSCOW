import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { queryIfInitialized } from "src/utils/init";

export interface CreateInitAdminSchema {
  method: "POST";

  body: {
    identityId: string;
    name: string;
    email: string;
    password: string;
    existsInAuth: boolean | undefined;
  };

  responses: {
    200: {
      created: boolean,
    }
    204: null;

    400: { code: "USER_ID_NOT_VALID" };

    409: { code: "ALREADY_INITIALIZED"; }

  }
}

const userIdRegex = publicConfig.USERID_PATTERN ? new RegExp(publicConfig.USERID_PATTERN) : undefined;

export default route<CreateInitAdminSchema>("CreateInitAdminSchema", async (req) => {
  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" } }; }

  const { email, identityId, name, password, existsInAuth } = req.body;

  if (userIdRegex && !userIdRegex.test(identityId)) {
    return { 400: {
      code: "USER_ID_NOT_VALID",
      message: `user id must match ${publicConfig.USERID_PATTERN}`,
    } };
  }

  const client = getClient(InitServiceClient);
  const created = await asyncClientCall(client, "createInitAdmin", {
    email, name, userId: identityId, password, existsInAuth,
  });

  return { 
    created: created,
  };

});

