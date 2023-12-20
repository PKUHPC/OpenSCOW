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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { TRPCError } from "@trpc/server";
import { router } from "src/server/trpc/def";
import { procedure } from "src/server/trpc/procedure/base";
import { getAdapterClient } from "src/server/utils/clusters";
import { z } from "zod";

export const accountRouter = router({

  listAccounts: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/account",
        tags: ["account"],
        summary: "List all accounts",
      },
    })
    .input(z.object({ clusterId: z.optional(z.string()) }))
    .output(z.object({ accounts: z.array(z.string()) }))
    .query(async ({ input, ctx: { user } }) => {
      const { clusterId } = input;
      if (!clusterId) {
        return { accounts: []};
      }
      const client = getAdapterClient(clusterId);
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:`cluster ${clusterId} is not found`,
        });
      }
      return await asyncClientCall(client.account, "listAccounts", { userId: user!.identityId });
    }),
});
