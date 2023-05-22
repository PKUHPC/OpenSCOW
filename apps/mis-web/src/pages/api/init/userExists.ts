/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { InitServiceClient } from "@scow/protos/build/server/init";
import { getClient } from "src/utils/client";

export interface UserExistsSchema {
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
  }
}

export default route<UserExistsSchema>("UserExistsSchema", async (req) => {

  const { identityId } = req.body;

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
