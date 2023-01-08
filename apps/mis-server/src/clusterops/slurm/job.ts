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

import { getRunningJobs } from "@scow/lib-slurm";
import { sshConnect } from "@scow/lib-ssh";
import { JobOps } from "src/clusterops/api/job";
import { SlurmClusterInfo } from "src/clusterops/slurm";
import { handleSimpleResponse, throwIfNotReturn0 } from "src/clusterops/slurm/utils/slurm";
import { rootKeyPair } from "src/config/env";

export const slurmJobOps = ({ slurmConfig, executeSlurmScript }: SlurmClusterInfo): JobOps => {

  return {
    getRunningJobs: async ({ request, logger }) => {
      const { userId, accountNames, jobIdList } = request;
      
      const jobs = await sshConnect(slurmConfig.managerUrl, "root", rootKeyPair, logger, async (ssh) => {
        return await getRunningJobs(ssh, "root", { userId, accountNames, jobIdList }, logger);
      });

      return { jobs };
    },

    queryJobTimeLimit: async ({ request, logger }) => {
      const { jobId } = request;
      const result = await executeSlurmScript(["-t", jobId], logger);

      if (result.code === 7) {
        return { code: "NOT_FOUND" };
      }

      throwIfNotReturn0(result);

      // format is [d-]hh:mm:ss, 5-00:00:00 or 00:03:00
      // convert to second

      const results = result.stdout.trim().split(/-|:/).map((x) => +x);

      const [d, h, m, s] = results[3] === undefined
        ? [0, ...results]
        : results;

      return { code: "OK", limit: s + m * 60 + h * 60 * 60 + d * 60 * 60 * 24 };
    },

    changeJobTimeLimit: async ({ request, logger }) => {
      const { delta, jobId } = request;

      const result = await executeSlurmScript(["-n", jobId, delta + ""], logger);

      return handleSimpleResponse(result, { 7: "NOT_FOUND" });
    },
  };
};
