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

export const slurmAccountOps = ({ executeSlurmScript }: SlurmClusterInfo): AccountOps => {

  return {
    createAccount: async ({ request, logger }) => {
      const { accountName, ownerId } = request;
      const result = await executeSlurmScript(["-c", accountName, "0", ownerId ], logger);

      if (result.code === 6) {
        return { code: "ALREADY_EXISTS" };
      }
      return { code: "OK" };
    },

    deleteAccount: async ({ request, logger }) => {
      const { accountName } = request;
      const result = await executeSlurmScript(["-a", accountName], logger);

      if (result.code === 7) {
        return { code: "NOT_FOUND" };
      }

      return { code: "OK" };
    },

    blockAccount: async ({ request, logger }) => {
      const { accountName } = request;

      const result = await executeSlurmScript(["-b", accountName], logger);

      if (result.code === 8) {
        return { code: "ALREADY_BLOCKED" };
      }

      if (result.code === 7) {
        return { code: "NOT_FOUND" };
      }

      return { code: "OK" };
    },

    unblockAccount: async ({ request, logger }) => {
      const { accountName } = request;

      const result = await executeSlurmScript(["-d", accountName], logger);

      if (result.code === 9) {
        return { code: "ALREADY_UNBLOCKED" };
      }

      if (result.code === 7) {
        return { code: "NOT_FOUND" };
      }

      return { code: "OK" };
    },
  };
};
