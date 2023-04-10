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

import { AccountOps } from "src/clusterops/api/account";
import { SlurmClusterInfo } from "src/clusterops/slurm";
import { parseBlockStatus, parseClusterAccounts } from "src/clusterops/slurm/utils/parse";
import { handleSimpleResponse, throwIfNotReturn0 } from "src/clusterops/slurm/utils/slurm";

export const slurmAccountOps = ({ executeSlurmScript }: SlurmClusterInfo): AccountOps => {

  return {
    createAccount: async ({ request, logger }) => {
      const { accountName, ownerId } = request;
      const result = await executeSlurmScript(["-c", accountName, "0", ownerId ], logger);

      return handleSimpleResponse(result, { 6: "ALREADY_EXISTS" });
    },

    deleteAccount: async ({ request, logger }) => {
      const { accountName } = request;
      const result = await executeSlurmScript(["-a", accountName], logger);

      return handleSimpleResponse(result, { 7: "NOT_FOUND" });

    },

    blockAccount: async ({ request, logger }) => {
      const { accountName } = request;

      const result = await executeSlurmScript(["-b", accountName], logger);

      return handleSimpleResponse(result, { 8: "ALREADY_BLOCKED", 7: "NOT_FOUND" });
    },

    unblockAccount: async ({ request, logger }) => {
      const { accountName } = request;

      const result = await executeSlurmScript(["-d", accountName], logger);

      return handleSimpleResponse(result, { 9: "ALREADY_UNBLOCKED", 7: "NOT_FOUND" });
    },

    getAllAccountsWithUsers: async ({ logger }) => {
      const result = await executeSlurmScript(["-l", "all"], logger);

      throwIfNotReturn0(result);

      const accounts = parseClusterAccounts(result.stdout);

      const blockStatusReply = await executeSlurmScript(["-m", accounts.map((x) => x.accountName).join(",")], logger);
      const accountsBlockStatus = parseBlockStatus(blockStatusReply.stdout);

      for (const account of accounts) {
        const status = accountsBlockStatus[account.accountName];
        account.blocked = status === undefined ? true : status;
      }

      return { accounts };
    },

  };
};
