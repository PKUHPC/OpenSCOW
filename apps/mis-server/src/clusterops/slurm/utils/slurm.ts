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
import { loggedExec, sshConnect } from "@scow/lib-ssh";
import { rootKeyPair } from "src/config/env";

export const executeScript = async (
  slurmMisConfig: SlurmMisConfigSchema, cmd: string, parameters: string[], env: NodeJS.ProcessEnv, logger: Logger,
) => {

  const host = slurmMisConfig.managerUrl;

  return await sshConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    return await loggedExec(ssh, logger, true, cmd, parameters, { execOptions: { env } });
  });
};


export const executeSlurmScript = async (
  slurmMisConfig: SlurmMisConfigSchema, partitions: string[], params: string[], logger: Logger,
) => {

  const partitionsParam = partitions.map((x) => "\"" + x + "\"").join(" ");

  const result = await executeScript(slurmMisConfig, slurmMisConfig.scriptPath, params, {
    BASE_PARTITIONS: partitionsParam,
    CLUSTER_NAME: slurmMisConfig.clusterName,
    DB_HOST: slurmMisConfig.dbHost,
    DB_PORT: String(slurmMisConfig.dbPort),
    DB_USER: slurmMisConfig.dbUser,
    DB_PASSWORD: slurmMisConfig.dbPassword,
    SLURM_ACCT_DB_NAME: slurmMisConfig.slurmAcctDbName,
  }, logger);

  return result;
};

