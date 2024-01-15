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
import paginationSchema from "src/server/utils/paginationSchema ";
import { z } from "zod";

export const accountRouter = router({

  listAccounts: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/accounts",
        tags: ["account"],
        summary: "List all accounts",
      },
    })
    .input(z.object({
      clusterId: z.optional(z.string()),
      ...paginationSchema.shape,
    }))
    .output(z.object({ accounts: z.array(z.string()), count: z.number() }))
    .query(async ({ input, ctx: { user } }) => {
      const { clusterId, page, pageSize } = input;
      if (!clusterId) {
        return { accounts: [], count: 0 };
      }
      const client = getAdapterClient(clusterId);
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:`cluster ${clusterId} is not found`,
        });
      }
      const { accounts } = await asyncClientCall(client.account, "listAccounts", { userId: user.identityId });

      if (page === undefined || pageSize === undefined) {

        return { accounts: accounts, count: accounts.length };

      } else {

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        // 检查 startIndex 是否超出数据总量
        if (startIndex >= accounts.length) {
          return { accounts: [], count: accounts.length };
        }

        const paginatedAccounts = accounts.slice(startIndex, Math.min(endIndex, accounts.length));

        return { accounts: paginatedAccounts, count: accounts.length };
      }

    }),
});
