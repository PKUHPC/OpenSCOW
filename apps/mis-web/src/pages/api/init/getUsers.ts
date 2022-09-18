import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import type { User } from "src/generated/server/user";
import { UserServiceClient } from "src/generated/server/user";
import { getClient } from "src/utils/client";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { queryIfInitialized } from "src/utils/init";

export interface InitGetUsersSchema {
  method: "GET";

  responses: {
    200: {
      users: User[];
    }

    409: { code: "ALREADY_INITIALIZED"; }
  }
}

export default route<InitGetUsersSchema>("InitGetUsersSchema", async () => {

  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" } }; }

  const client = getClient(UserServiceClient);

  const reply = await asyncClientCall(client, "getUsers", {
    tenantName: DEFAULT_TENANT_NAME,
  });

  return {
    200: {
      users: reply.users,
    },
  };

});
