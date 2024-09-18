/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Logger } from "@ddadaal/tsgrpc-server";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { updateBlockStatusInSlurm, updateUnblockStatusInSlurm } from "src/bl/block";
import { SystemState } from "src/entities/SystemState";
import { ClusterPlugin } from "src/plugins/clusters";

export let lastSyncTime: Date | null = null;

export async function synchronizeBlockStatus(
  em: SqlEntityManager<MySqlDriver>,
  logger: Logger,
  clusterPlugin: ClusterPlugin,
) {
  const { blockedFailedAccounts, blockedFailedUserAccounts } =
   await updateBlockStatusInSlurm(em, clusterPlugin.clusters, logger);
  const { unblockedFailedAccounts } = await updateUnblockStatusInSlurm(em, clusterPlugin.clusters, logger);

  lastSyncTime = new Date();

  const updateBlockTime = await em.upsert(SystemState, {
    key: SystemState.KEYS.UPDATE_SLURM_BLOCK_STATUS,
    value: new Date().toISOString(),
  });
  await em.persistAndFlush(updateBlockTime);
  return { blockedFailedAccounts, blockedFailedUserAccounts, unblockedFailedAccounts };
}
