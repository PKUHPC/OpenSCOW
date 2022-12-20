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
import { UserServiceClient } from "@scow/protos/build/server/user";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";

export interface QueryStorageUsageSchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: {
      result: number;
    };

    404: null;
  }
}

export default route<QueryStorageUsageSchema>("QueryStorageUsageSchema", async (req, res) => {

  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(UserServiceClient);

  const reply = await asyncClientCall(client, "queryUsedStorageQuota", {
    tenantName: info.tenant,
    userId: info.identityId,
    cluster: cluster,
  });

  return {
    200: {
      result: reply.used,
    },
  };

});
