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

export const slurmUserOps = ({ executeSlurmScript }: SlurmClusterInfo): UserOps => {

  return {
    addUserToAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-g", accountName, "0", userId], logger);
      if (result.code === 3) {
        return { code: "ALREADY_EXISTS" };
      }

      return { code: "OK" };
    },
    removeUser: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-k", accountName, userId], logger);
      if (result.code === 4) { return { code: "NOT_FOUND" }; }
      return { code: "OK" };
    },

    blockUserInAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-o", accountName, userId], logger);
      if (result.code === 4) { return { code: "NOT_FOUND" }; }
      return { code: "OK" };
    },

    unblockUserInAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-r", accountName, userId], logger);
      if (result.code === 4) { return { code: "NOT_FOUND" }; }
      return { code: "OK" };
    },

    getAllUsersInAccounts: async ({ logger }) => {
      const result = await executeSlurmScript(["-l", "all"], logger);
      return { result: result.stdout };
    },

  };
};
