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

import { ChangeStorageQuotaMode, StorageOps } from "src/clusterops/api/storage";
import { SlurmClusterInfo } from "src/clusterops/slurm";
import { throwIfNotReturn0 } from "src/clusterops/slurm/utils/slurm";

export const slurmStorageOps = ({ executeSlurmScript }: SlurmClusterInfo): StorageOps => {
  return {
    queryUsedStorageQuota: async ({ request, logger }) => {
      const { userId } = request;
      const result = await executeSlurmScript(["-y", userId], logger);

      if (result.code === 2) {
        return { code: "NOT_FOUND" };
      }

      throwIfNotReturn0(result);

      /**
       * format is
       *
       * used: 512K
       * quota: 2T
       *
       * used显示为整数位大于等于1的最大单位，比如如果是1025K的话，会显示1.001M
       */

      const usedLine = result.stdout.split("\n")
        .find((x) => x.startsWith("used:"));

      function throwError(): never {
        logger.error(`Unexpected -y output. stdout: ${result.stdout}`);

        throw new Error("Unexpected cmdline output");
      }

      if (usedLine) {
        const val = usedLine.substring("used: ".length);

        // parseFloat parses starting num, ignoring what's following a now
        const numVal = parseFloat(val);
        if (isNaN(numVal)) {
          throwError();
        }

        // parse unit to bytes
        const units = {
          "B": 0,
          "K": 1,
          "M": 2,
          "G": 3,
          "T": 4,
          "P": 5,
        };

        const unit = val[val.length - 1];

        const pow = units[unit] ?? 0;

        const bytesVal = numVal * Math.pow(1024, pow);

        return { code: "OK", used: bytesVal };
      }

      throwError();
    },
    changeStorageQuota: async ({ request, logger }) => {
      const { userId, mode, value } = request;
      const command = {
        [ChangeStorageQuotaMode.DECREASE]: "-w",
        [ChangeStorageQuotaMode.INCREASE]: "-z",
        [ChangeStorageQuotaMode.SET]: "-x",
      };

      const result = await executeSlurmScript([command[mode], userId, value + ""], logger);

      if (result.code === 4) {
        return { code: "NOT_FOUND" };
      }

      throwIfNotReturn0(result);

      // TODO handle output format
      return { code: "OK", currentQuota: 10 };
    },
  };
};
