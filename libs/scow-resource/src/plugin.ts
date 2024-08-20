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

import { Plugin, plugin } from "@ddadaal/tsgrpc-server";
import { ScowResourceConfigSchema } from "@scow/config/build/common";
import { AssignAccountOnCreateRequest, 
  GetAccountAssignedPartitionsForClusterRequest, 
  GetAccountsAssignedClusterIdsRequest, 
  GetAccountsAssignedClustersAndPartitionsRequest, 
  GetAccountsAssignedClustersAndPartitionsResponse, 
  GetTenantAssignedClustersAndPartitionsRequest, 
  GetTenantAssignedClustersAndPartitionsResponse } from "@scow/scow-resource-protos/generated/resource/partition";

import { getScowResourceClient } from "./client";

export interface ScowResourcePlugin {
  resource: {

    assignAccountOnCreate: (params: AssignAccountOnCreateRequest) => 
    Promise<void>;

    getAccountAssignedPartitionsForCluster: (params: GetAccountAssignedPartitionsForClusterRequest) => 
    Promise<string[]>;

    getAccountsAssignedClusterIds: (params: GetAccountsAssignedClusterIdsRequest) => 
    Promise<string[]>;

    getAccountsAssignedClustersAndPartitions: (params: GetAccountsAssignedClustersAndPartitionsRequest) => 
    Promise<GetAccountsAssignedClustersAndPartitionsResponse>;

    getTenantAssignedClustersAndPartitions: (params: GetTenantAssignedClustersAndPartitionsRequest) =>
    Promise<GetTenantAssignedClustersAndPartitionsResponse>;

  }
};
  
export const scowResourcePlugin = (
  config: ScowResourceConfigSchema,
): Plugin => plugin(async (f) => {
  
  const logger = f.logger.child({ plugin: "scow-resource" });
  
  if (!config?.enabled) {
    logger.info("No scow-resource related configuration.");
    return;
  }
  
  const client = getScowResourceClient(config.address);

  const assignAccountOnCreate = async (params: AssignAccountOnCreateRequest) => {
    return await client.resource.assignAccountOnCreate(params);
  };

  const getAccountAssignedPartitionsForCluster = async (params: GetAccountAssignedPartitionsForClusterRequest) => { 
    const reply = await client.resource.getAccountAssignedPartitionsForCluster(params);
    return reply.assignedPartitionNames;
  };
  const getAccountsAssignedClusterIds = async (params: GetAccountsAssignedClusterIdsRequest) => { 
    return await client.resource.getAccountsAssignedClusterIds(params);
  };

  const getAccountsAssignedClustersAndPartitions = async (params: GetAccountsAssignedClustersAndPartitionsRequest) => { 
    const reply = await client.resource.getAccountsAssignedClustersAndPartitions(params);
    return reply.assignedClusterPartitions;
  };

  const getTenantAssignedClustersAndPartitions = async (params: GetTenantAssignedClustersAndPartitionsRequest) => {
    const reply = await client.resource.getTenantAssignedClustersAndPartitions(params);
    return reply.assignedClusterPartitions;
  };
 
  f.addExtension("resource", 
    { 
      assignAccountOnCreate,
      getAccountAssignedPartitionsForCluster,
      getAccountsAssignedClusterIds,
      getAccountsAssignedClustersAndPartitions,
      getTenantAssignedClustersAndPartitions,
    });
});