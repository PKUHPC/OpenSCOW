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

import { UserOps } from "src/clusterops/api/user";
import { SlurmClusterInfo } from "src/clusterops/slurm";
import { handleSimpleResponse, throwIfNotReturn0 } from "src/clusterops/slurm/utils/slurm";

export const slurmUserOps = ({ executeSlurmScript }: SlurmClusterInfo): UserOps => {

  return {
    addUserToAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-g", accountName, "0", userId], logger);

      return handleSimpleResponse(result, { 3: "ALREADY_EXISTS" });
    },
    removeUser: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-k", accountName, userId], logger);

      return handleSimpleResponse(result, { 4: "NOT_FOUND" });
    },

    blockUserInAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-o", accountName, userId], logger);

      return handleSimpleResponse(result, { 4: "NOT_FOUND" });
    },

    unblockUserInAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-r", accountName, userId], logger);

      return handleSimpleResponse(result, { 4: "NOT_FOUND" });
    },

    getAllUsersInAccounts: async ({ logger }) => {
      const result = await executeSlurmScript(["-l", "all"], logger);

      throwIfNotReturn0(result);

      return { result: result.stdout };
    },

  };
};
