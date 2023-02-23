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

import { Logger } from "@ddadaal/tsgrpc-server";
import { SlurmMisConfigSchema } from "@scow/config/build/mis";
import { sftpChmod, sshConnect } from "@scow/lib-ssh";
import { ClusterOps } from "src/clusterops/api";
import { slurmAccountOps } from "src/clusterops/slurm/account";
import { slurmJobOps } from "src/clusterops/slurm/job";
import { slurmStorageOps } from "src/clusterops/slurm/storage";
import { slurmUserOps } from "src/clusterops/slurm/user";
import { executeSlurmScript } from "src/clusterops/slurm/utils/slurm";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";

export interface SlurmClusterInfo {
  slurmConfig: SlurmMisConfigSchema;
  partitions: string[];

  executeSlurmScript: (params: string[], logger: Logger) => ReturnType<typeof executeSlurmScript>;
}

export const createSlurmOps = (cluster: string, logger: Logger): ClusterOps | undefined => {

  const slurmConfig = clusters[cluster].slurm;

  if (!slurmConfig) {
    throw new Error(`the slurm property of cluster ${cluster} in clusters/${cluster}.yaml is not set.`);
  }

  const slurmMisConfig = slurmConfig.mis;

  if (!slurmMisConfig) {
    logger.warn("the slurm.mis property of cluster %s is not set. Ignore the cluster.", cluster);
    return undefined;
  }

  const partitionNames = slurmConfig.partitions.map((x) => x.name);

  const clusterInfo: SlurmClusterInfo = {
    partitions: partitionNames,
    slurmConfig: slurmMisConfig,
    executeSlurmScript: (params, logger) => executeSlurmScript(slurmMisConfig, partitionNames, params, logger),
  };

  return {
    account: slurmAccountOps(clusterInfo),
    storage: slurmStorageOps(clusterInfo),
    job:  slurmJobOps(clusterInfo),
    user: slurmUserOps(clusterInfo),
    onStartup: async () => {
      return await sshConnect(slurmMisConfig.managerUrl, "root", rootKeyPair, logger, async (ssh) => {
        logger.info("start to copy slurm.sh");
        // 请求sftp对象
        const sftp = await ssh.requestSFTP();
        // 将slurm.sh复制入指定路径
        await ssh.putFile("scripts/slurm.sh", slurmMisConfig.scriptPath);
        // 修改文件权限
        await sftpChmod(sftp)(slurmMisConfig.scriptPath, "555");
        logger.info("copy slurm.sh sucessfully");
      });
    },
  };

};
