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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { ScowResourcePlugin } from "@scow/lib-scow-resource";
import { ensureResourceManagementFeatureAvailable } from "@scow/lib-server";
import { Logger } from "pino";
import { ClusterPlugin } from "src/plugins/clusters";

export async function unblockAccountAssignedPartitionsInCluster(
  accountName: string,
  tenantName: string,
  clusterId: string,
  clusterPlugin: ClusterPlugin["clusters"],
  logger: Logger,
  scowResourcePlugin?: ScowResourcePlugin["resource"],
) {

  // 获取当前集群下已授权的分区
  const unblockedPartitions = await scowResourcePlugin?.getAccountAssignedPartitionsForCluster({
    accountName,
    tenantName,
    clusterId,
  });

  if (unblockedPartitions === undefined) {
    throw {
      code: Status.NOT_FOUND, message: `Error occured during finding assigned partitions of account: ${accountName}`,
    } as ServiceError;
  }

  if (unblockedPartitions?.length === 0) {

    logger.info("No partitions assigned to account: %s, the default unblocking operation" +
              " was successfully performed; no additional execution is necessary.",
    accountName,
    );
    // 在集群中执行一次封锁来防止未来冲突
    await clusterPlugin.callOnOne(
      clusterId,
      logger,
      async (client) => { 
        // 调用适配器的 blockAccount
        await asyncClientCall(client.account, "blockAccount", {
          accountName,
        }); 
      },      
    );
  } else {
    await clusterPlugin.callOnOne(
      clusterId,
      logger,
      async (client) => { 

        // 检查当前适配器是否具有资源管理可选功能接口，同时判断当前适配器版本
        await ensureResourceManagementFeatureAvailable(client, logger);

        // 1.获取当前集群下的所有分区数据
        const clusterConfig = await asyncClientCall(client.config, "getClusterConfig", {
          cluster: clusterId,
        }); 
        const partitionNames = clusterConfig.partitions.map((p) => p.name);

        // 2.确认是否存在未授权分区需要再次封锁
        const mayNeedBlockPartitions = partitionNames.filter((p) => !unblockedPartitions.includes(p));
        if (mayNeedBlockPartitions.length > 0) {
          await asyncClientCall(client.account, "blockAccountWithPartitions", {
            accountName,
            blockedPartitions: mayNeedBlockPartitions,
          }); 
        }

        // 3.执行解封，调用适配器的 unblockAccountWithPartitions
        await asyncClientCall(client.account, "unblockAccountWithPartitions", {
          accountName,
          unblockedPartitions: unblockedPartitions,
        }); 
      },      
    );
    
  } 
};