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
import { loggedExec, sshConnect, SSHExecError } from "@scow/lib-ssh";
import { rootKeyPair } from "src/config/env";
// import {slurmAdapterConfig}
// replace all placeholder constants with slurm adapter config

export const executeScript = async (
  cmd: string, parameters: string[], env: NodeJS.ProcessEnv, logger: Logger,
) => {
  const host = "192.168.88.101";

  return await sshConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    return await loggedExec(ssh, logger, false, cmd, parameters, { execOptions: { env } });
  });
};

export const executeSlurmScript = async (
  params: string[], logger: Logger,
) => {
  const partitionsParam = ["compute"].join(" ");

  const result = await executeScript("/test/slurm.sh", params, {
    BASE_PARTITIONS: partitionsParam,
    CLUSTER_NAME: "hpc01",
    DB_HOST: "localhost",
    DB_PORT: "3306",
    DB_USER: "slurm",
    DB_PASSWORD: "123456",
    SLURM_ACCT_DB_NAME: "slurm_acct_db",
  }, logger);

  return result;
};

export const throwIfNotReturn0 = (result: Awaited<ReturnType<typeof executeSlurmScript>>) => {
  if (result.code !== 0) {
    throw new SSHExecError(result);
  }
};

/**
 * If result is zero, return empty object. If result is in map, throw the corresponding error. Otherwise throw.
 * @param result the SSH exec response
 * @param map the map from exit code to a ServiceError
 * @returns empty object
 */
export const handleSimpleResponse = <T>(
  result: Awaited<ReturnType<typeof executeSlurmScript>>, map: Record<number, T>,
) => {
  if (result.code === null) { throw new Error("Slurm script exited with null code"); }

  if (result.code === 0) { return {}; }

  const error = map[result.code];
  if (error) { throw error; }
  throw new SSHExecError(result);
};
