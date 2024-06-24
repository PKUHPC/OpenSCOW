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
import { Extensions } from "@ddadaal/tsgrpc-server";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { MySqlDriver, SqlEntityManager, UniqueConstraintViolationException } from "@mikro-orm/mysql";
import { createAccount } from "@scow/lib-auth";
import { ClusterActivationStatus } from "@scow/protos/build/server/config";
import { getClustersRuntimeInfo } from "src/bl/clustersUtils";
import { authUrl } from "src/config";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { callHook } from "src/plugins/hookClient";
import { logger } from "src/utils/logger";

import { asyncOperationRequests } from "../requests";
import { Operation, StateHandler } from "../requests/api";
import { operationStatus } from ".";

interface CreateClustersAccountParams {
  accountName: string; 
  tenantName: string; 
  ownerId: string; 
  comment?: string;
  clusters?: string[];
}

interface RetryCreatingClustersAccountParams extends CreateClustersAccountParams {
  createClustersAccountResult: CreateClustersAccountResult;
  shouldBlockInCluster: boolean;
}

interface WaitClustersActivateParams {
  accountName: string; 
  tenantName: string; 
  ownerId: string; 
  deactivatedClusterIds: string[];
  comment?: string;
}

interface CreateScowAccountParams extends CreateClustersAccountParams {
  deactivatedClusterIds: string[];
  createScowAccountResult?: CreateScowAccountResult;
}

interface CreateScowAccountResult {
  times: number;
}

interface CreateClustersAccountResult {
  times: number;
  alreadyExistAccountCluters: string[],
  createAccountFailedClusters: string[],
  changeBlockStatusFailedClusters: string[],
  allSucessfulClusters: string[],
}

export const CreateAccountStatus = {
  CREATING_SCOW_ACCOUNT: "creating_scow_account",
  CREATING_CLUSTERS_ACCOUNT: "creating_clusters_account",
  RETRY_CREATING_CLUSTERS_ACCOUNT: "retry_creating_clusters_account",
  WAITING_CLUSTERS_ACTIVATE: "wating_clusters_activate",
  PERFORMINNG_SIDE_EFFECT: "performing_side_effect",
} as const;

export const CreateAccountHandlersName = "CreateAccount";

export function getCreateAccountHandles() {
  const createAccountHandlers = new Map<string, StateHandler>();

  createAccountHandlers.set(CreateAccountStatus.CREATING_CLUSTERS_ACCOUNT, createClustersAccount);
  
  createAccountHandlers.set(CreateAccountStatus.RETRY_CREATING_CLUSTERS_ACCOUNT, retryCreatingClustersAccount);

  createAccountHandlers.set(CreateAccountStatus.CREATING_SCOW_ACCOUNT, createScowAccount);

  createAccountHandlers.set(CreateAccountStatus.WAITING_CLUSTERS_ACTIVATE, waitClustersActivate);

  return createAccountHandlers;
}

const createClustersAccount = async (
  em: SqlEntityManager<MySqlDriver>, 
  operation: Operation, 
  serverExtensions: Extensions,
) => {
  const { 
    tenantName,
    accountName, 
    ownerId,
    clusters,
  } = operation.params as CreateClustersAccountParams;

  const user = await em.findOne(User, { userId: ownerId, tenant: { name: tenantName } });

  if (!user) {
    logger.error(`User ${user} under tenant ${tenantName} does not exist`);
    await asyncOperationRequests?.completeLongRunningOperation({ 
      id: operation.id, 
      status: operationStatus.FAILED,
      progress: { ...operation.progress, [CreateAccountStatus.CREATING_SCOW_ACCOUNT]: { 
        result: operationStatus.FAILED,
        msg: `User ${user} under tenant ${tenantName} does not exist`,
      } },
    }, logger);
    
    return;
  }

  const tenant = await em.findOne(Tenant, { name: tenantName });
  if (!tenant) {
    await asyncOperationRequests?.completeLongRunningOperation({ 
      id: operation.id, 
      status: operationStatus.FAILED,
      progress: { ...operation.progress, [CreateAccountStatus.CREATING_SCOW_ACCOUNT]: { 
        result: operationStatus.FAILED,
        msg: `Tenant ${tenantName} is not found`,
      } },
    }, logger);

    return;
  }

  // 新建账户时比较租户默认封锁阈值，如果租户默认封锁阈值小于0则保持账户为在集群中可用状态
  // 如果租户默认封锁阈值大于等于0，则封锁账户
  const shouldBlockInCluster: boolean = tenant.defaultAccountBlockThreshold.gte(0);

  const clustersDbInfo = await getClustersRuntimeInfo(em, logger);

  if (!clusters) {
    const deactivatedClusterIds = clustersDbInfo.filter((cluster) => {
      return cluster.activationStatus === ClusterActivationStatus.DEACTIVATED;
    }).map((cluster) => cluster.clusterId);
    operation.params = { ...operation.params, deactivatedClusterIds };
  }
  
  const activatedClusterIds = clustersDbInfo.filter((cluster) => {
    return cluster.activationStatus === ClusterActivationStatus.ACTIVATED;
  }).map((cluster) => cluster.clusterId);

  const execClusterIds = clusters ?? activatedClusterIds;

  logger.info("Creating account in cluster.");
  const createResult: CreateClustersAccountResult = {
    times: 1,
    alreadyExistAccountCluters: [],
    createAccountFailedClusters: [],
    changeBlockStatusFailedClusters: [],
    allSucessfulClusters: [],
  };

  for (const cluster of execClusterIds) {
    await serverExtensions.clusters.callOnOne(
      cluster,
      logger,
      async (client) => {
        await asyncClientCall(client.account, "createAccount", {
          accountName, ownerUserId: ownerId,
        }).catch((e) => {
          if ((e as any).code === Status.ALREADY_EXISTS) {
            createResult.alreadyExistAccountCluters.push(cluster);
          }
          createResult.createAccountFailedClusters.push(cluster);
        });
  
        // 判断为需在集群中封锁时
        if (shouldBlockInCluster) {
          await asyncClientCall(client.account, "blockAccount", {
            accountName,
          }).catch(() => {
            createResult.changeBlockStatusFailedClusters.push(cluster);
          });
        } else { // 判断为需在集群中解封时
          await asyncClientCall(client.account, "unblockAccount", {
            accountName,
          }).catch(() => {
            createResult.changeBlockStatusFailedClusters.push(cluster);
          });
        }

        createResult.allSucessfulClusters.push(cluster);
      },
    );
  };

  // 如果某个集群中账户已存在，则 scow 创建该账户失败
  if (createResult.alreadyExistAccountCluters.length !== 0) {
    logger.error("Create account failed. " 
      + `The account ${accountName} already exists in clusters ${createResult.alreadyExistAccountCluters}.`);
    await asyncOperationRequests?.completeLongRunningOperation({ 
      id: operation.id, 
      status: operationStatus.FAILED,
      params: { ...operation.params, createResult },
      progress: { ...operation.progress, [CreateAccountStatus.CREATING_CLUSTERS_ACCOUNT]: { 
        result: operationStatus.FAILED,
        data: createResult,
        msg: `The account ${accountName} already exists in clusters ${createResult.alreadyExistAccountCluters}.`,
      } },
    }, logger);

    return;
  } else if (createResult.allSucessfulClusters.length !== execClusterIds.length) {

    await asyncOperationRequests?.updateLongRunningOperation({ 
      id: operation.id, 
      params: { ...operation.params, createResult, shouldBlockInCluster },
      progress: { ...operation.progress, [CreateAccountStatus.RETRY_CREATING_CLUSTERS_ACCOUNT]: { 
        result: operationStatus.PARTIAL_SUCCESS,
        data: createResult,
        msg: "Some clusters have successfully added accounts. Retrying",
      } },
    }, logger);

  } else {
    logger.info(`Account ${accountName} has been created in clusters ${execClusterIds}.`);

    operation.progress = { ...operation.progress, [CreateAccountStatus.CREATING_CLUSTERS_ACCOUNT]: { 
      result: operationStatus.SUCCESS,
      data: createResult,
      msg: "All clusters have successfully added accounts.",
    } };

    if (clusters === undefined) {
      createScowAccount(em, operation, serverExtensions);
    } else {
      await asyncOperationRequests?.completeLongRunningOperation({ 
        id: operation.id, 
        status: operationStatus.SUCCESS,
        progress: { ...operation.progress, [CreateAccountStatus.CREATING_CLUSTERS_ACCOUNT]: { 
          result: operationStatus.SUCCESS,
          msg: "Excute Successful.",
        } },
      }, logger);
    }
  }
};

const retryCreatingClustersAccount = async (
  em: SqlEntityManager<MySqlDriver>, 
  operation: Operation, 
  serverExtensions: Extensions,
) => {
  const plannedRetryNum = 3;

  const { 
    accountName, ownerId, shouldBlockInCluster, clusters, createClustersAccountResult,
  } = operation.params as RetryCreatingClustersAccountParams;

  if (createClustersAccountResult.times + 1 > plannedRetryNum) {
    await asyncOperationRequests?.completeLongRunningOperation({ 
      id: operation.id, 
      status: operationStatus.FAILED,
      params: { ...operation.params, createClustersAccountResult },
      progress: { ...operation.progress, [CreateAccountStatus.RETRY_CREATING_CLUSTERS_ACCOUNT]: { 
        result: operationStatus.FAILED,
        data: createClustersAccountResult,
        msg: `After retrying ${plannedRetryNum} times, create the account still fails.`,
      } },
    }, logger);
    return;
  }

  const clustersDbInfo = await getClustersRuntimeInfo(em, logger);

  const activatedClusterIds = clustersDbInfo.filter((cluster) => {
    return cluster.activationStatus === ClusterActivationStatus.ACTIVATED;
  }).map((cluster) => cluster.clusterId);

  // 尝试创建账户
  const newCreateResult: CreateClustersAccountResult = {
    times: createClustersAccountResult.times + 1,
    alreadyExistAccountCluters: [],
    createAccountFailedClusters: [],
    changeBlockStatusFailedClusters: [],
    allSucessfulClusters: [...createClustersAccountResult.allSucessfulClusters],
  };

  for (const cluster of createClustersAccountResult.createAccountFailedClusters) {
    await serverExtensions.clusters.callOnOne(
      cluster,
      logger,
      async (client) => {
        await asyncClientCall(client.account, "createAccount", {
          accountName, ownerUserId: ownerId,
        }).catch((e) => {
          if ((e as any).code === Status.ALREADY_EXISTS) {
            newCreateResult.alreadyExistAccountCluters.push(cluster);
          }
          newCreateResult.createAccountFailedClusters.push(cluster);
        });
  
        // 判断为需在集群中封锁时
        if (shouldBlockInCluster) {
          await asyncClientCall(client.account, "blockAccount", {
            accountName,
          }).catch(() => {
            newCreateResult.changeBlockStatusFailedClusters.push(cluster);
          });
        } else { // 判断为需在集群中解封时
          await asyncClientCall(client.account, "unblockAccount", {
            accountName,
          }).catch(() => {
            newCreateResult.changeBlockStatusFailedClusters.push(cluster);
          });
        }

        newCreateResult.allSucessfulClusters.push(cluster);
      },
    );
  };

  // 尝试仅修改账户封锁状态
  for (const cluster of createClustersAccountResult.changeBlockStatusFailedClusters) {
    await serverExtensions.clusters.callOnOne(
      cluster,
      logger,
      async (client) => {
        // 判断为需在集群中封锁时
        if (shouldBlockInCluster) {
          await asyncClientCall(client.account, "blockAccount", {
            accountName,
          }).catch(() => {
            newCreateResult.changeBlockStatusFailedClusters.push(cluster);
          });
        } else { // 判断为需在集群中解封时
          await asyncClientCall(client.account, "unblockAccount", {
            accountName,
          }).catch(() => {
            newCreateResult.changeBlockStatusFailedClusters.push(cluster);
          });
        }

        newCreateResult.allSucessfulClusters.push(cluster);
      },
    );
  };

  // 如果某个集群中账户已存在，则 scow 创建该账户失败
  if (createClustersAccountResult.alreadyExistAccountCluters.length !== 0) {
    logger.error("Create account failed." 
      + `The account ${accountName} already exists in clusters` 
      + `${createClustersAccountResult.alreadyExistAccountCluters}.`);
    await asyncOperationRequests?.completeLongRunningOperation({ 
      id: operation.id, 
      status: operationStatus.FAILED,
      params: { ...operation.params, createClustersAccountResult: newCreateResult },
      progress: { ...operation.progress, [CreateAccountStatus.RETRY_CREATING_CLUSTERS_ACCOUNT]: { 
        result: operationStatus.FAILED,
        data: newCreateResult,
        msg: `The account ${accountName} already exists in clusters ${newCreateResult.alreadyExistAccountCluters}.`,
      } },
    }, logger);

    return;
  } else if (createClustersAccountResult.allSucessfulClusters.length !== activatedClusterIds.length) {
    operation.status = CreateAccountStatus.RETRY_CREATING_CLUSTERS_ACCOUNT;
    operation.progress = { ...operation.progress, [CreateAccountStatus.RETRY_CREATING_CLUSTERS_ACCOUNT]: { 
      result: operationStatus.PARTIAL_SUCCESS,
      data: newCreateResult,
      msg: "Some clusters have successfully added accounts. Retrying",
    } },
    operation.params = { ...operation.params, createClustersAccountResult: newCreateResult };

    await retryCreatingClustersAccount(em, operation, serverExtensions);
  } else {

    logger.info(`Account ${accountName} has been created in clusters` 
      + `${createClustersAccountResult.createAccountFailedClusters}.`);

    operation.progress = { ...operation.progress, [CreateAccountStatus.RETRY_CREATING_CLUSTERS_ACCOUNT]: { 
      result: operationStatus.SUCCESS,
      data: newCreateResult,
      msg: "All clusters have successfully added accounts.",
    } };

    if (clusters === undefined) {
      createScowAccount(em, operation, serverExtensions);
    } else {
      await asyncOperationRequests?.completeLongRunningOperation({ 
        id: operation.id, 
        status: operationStatus.SUCCESS,
        progress: { ...operation.progress, [CreateAccountStatus.RETRY_CREATING_CLUSTERS_ACCOUNT]: { 
          result: operationStatus.SUCCESS,
          data: newCreateResult,
          msg: "Excute Successful.",
        } },
      }, logger);
    }
    
  }

};

const createScowAccount = async (
  em: SqlEntityManager<MySqlDriver>, 
  operation: Operation, 
  serverExtensions: Extensions,
) => {

  const plannedRetryNum = 3;

  const { 
    accountName, comment, tenantName, ownerId, createScowAccountResult, deactivatedClusterIds,
  } = operation.params as CreateScowAccountParams;

  if (createScowAccountResult && createScowAccountResult.times > plannedRetryNum) {
    await asyncOperationRequests?.completeLongRunningOperation({ 
      id: operation.id, 
      status: operationStatus.FAILED,
      progress: { ...operation.progress, [CreateAccountStatus.CREATING_SCOW_ACCOUNT]: { 
        result: operationStatus.FAILED,
        data: {
          times: plannedRetryNum,
        },
        msg: `After retrying ${plannedRetryNum} times, create the account still fails.`,
      } },
    }, logger);
  }
  
  const user = await em.findOne(User, { userId: ownerId, tenant: { name: tenantName } });

  if (!user) {
    logger.error(`User ${user} under tenant ${tenantName} does not exist`);
    await asyncOperationRequests?.completeLongRunningOperation({ 
      id: operation.id, 
      status: operationStatus.FAILED,
      progress: { ...operation.progress, [CreateAccountStatus.CREATING_SCOW_ACCOUNT]: { 
        result: operationStatus.FAILED,
        msg: `User ${user} under tenant ${tenantName} does not exist`,
      } },
    }, logger);
    
    return;
  }

  const tenant = await em.findOne(Tenant, { name: tenantName });
  if (!tenant) {
    await asyncOperationRequests?.completeLongRunningOperation({ 
      id: operation.id, 
      status: operationStatus.FAILED,
      progress: { ...operation.progress, [CreateAccountStatus.CREATING_SCOW_ACCOUNT]: { 
        result: operationStatus.FAILED,
        msg: `Tenant ${tenantName} is not found`,
      } },
    }, logger);

    return;
  }

  // 新建账户时比较租户默认封锁阈值，如果租户默认封锁阈值小于0则保持账户为在集群中可用状态
  // 如果租户默认封锁阈值大于等于0，则封锁账户
  const shouldBlockInCluster: boolean = tenant.defaultAccountBlockThreshold.gte(0);

  // insert the account now to avoid future conflict
  const account = new Account({ accountName, comment, tenant, blockedInCluster: shouldBlockInCluster });

  const userAccount = new UserAccount({
    account, user, role: UserRole.OWNER, blockedInCluster: UserStatus.UNBLOCKED,
  });

  try {
    await em.persistAndFlush([account, userAccount]);
  } catch (e) {
    if (e instanceof UniqueConstraintViolationException) {
      await asyncOperationRequests?.completeLongRunningOperation({ 
        id: operation.id, 
        status: operationStatus.FAILED,
        progress: { ...operation.progress, [CreateAccountStatus.CREATING_SCOW_ACCOUNT]: { 
          result: operationStatus.FAILED,
          msg: `Account ${accountName} already exists.`,
        } },
      }, logger);

      return;
    }

    await asyncOperationRequests?.updateLongRunningOperation({ 
      id: operation.id, 
      params: { ...operation.params, createScowAccountResult: { 
        ...createScowAccount, times: (createScowAccountResult?.times ?? 0) + 1 } },
      progress: { ...operation.progress, [CreateAccountStatus.CREATING_SCOW_ACCOUNT]: {
        data: {
          times: (createScowAccountResult?.times ?? 0) + 1,
        },
        result: operationStatus.FAILED,
        msg: `An unknown error occurred while creating the scow account. ${e}`,
      } },
    }, logger);
  }

  logger.info(`Account ${accountName} has been created in scow.`);

  // 如果有未启用的集群则在启用集群创建账户成功后提交一个同步数据的异步操作
  if (deactivatedClusterIds.length !== 0) {
    await asyncOperationRequests?.createLongRunningOperation({
      type: CreateAccountHandlersName,
      status: CreateAccountStatus.WAITING_CLUSTERS_ACTIVATE,
      params: { accountName, tenantName, ownerId, comment, deactivatedClusterIds },
      progress: {},
    }, logger);
  }

  await asyncOperationRequests?.completeLongRunningOperation({ 
    id: operation.id, 
    status: operationStatus.SUCCESS,
    progress: { ...operation.progress, [CreateAccountStatus.CREATING_SCOW_ACCOUNT]: { 
      result: operationStatus.SUCCESS,
      msg: "Excute Successful.",
    } },
  }, logger);

  performSideEffect(operation, serverExtensions);
};

const waitClustersActivate = async (
  em: SqlEntityManager<MySqlDriver>, 
  operation: Operation, 
  serverExtensions: Extensions,
) => {

  const { 
    accountName, tenantName, ownerId, comment, deactivatedClusterIds,
  } = operation.params as WaitClustersActivateParams;

  logger.info(`Check whether the clusters ${deactivatedClusterIds} is enabled`);

  const clustersDbInfo = await getClustersRuntimeInfo(em, logger);

  const changeStatusCluster = deactivatedClusterIds.filter((clusterId) => {
    return !!clustersDbInfo.find((clusterInfo) => {
      return clusterInfo.clusterId === clusterId && clusterInfo.activationStatus === ClusterActivationStatus.ACTIVATED;
    });
  });

  if (changeStatusCluster.length !== 0) {

    const activateClustersOperation = {
      ...operation,
      params: {
        accountName, tenantName, ownerId, comment, clusters: changeStatusCluster,
      },
      progress: {
        [CreateAccountStatus.WAITING_CLUSTERS_ACTIVATE]: {
          result: operationStatus.SUCCESS,
        },
      },
    };
    createClustersAccount(em, activateClustersOperation, serverExtensions);

    const noChangeStatusCluster = deactivatedClusterIds.filter((clusterId) => !changeStatusCluster.includes(clusterId));
    noChangeStatusCluster.length !== 0 && asyncOperationRequests?.updateLongRunningOperation({ 
      id: operation.id, 
      params: { ...operation.params, deactivatedClusterIds: noChangeStatusCluster },
      progress: { ...operation.progress },
    }, logger);
  }
};

const performSideEffect = async (
  operation: Operation, 
  serverExtensions: Extensions,
) => {
  const { accountName, comment, tenantName, ownerId } = operation.params as CreateScowAccountParams;

  await callHook("accountCreated", { accountName, comment, ownerId, tenantName }, logger);

  if (serverExtensions.capabilities.accountUserRelation) {
    await createAccount(authUrl, { accountName, ownerUserId: ownerId }, logger);
  }

  return;
};