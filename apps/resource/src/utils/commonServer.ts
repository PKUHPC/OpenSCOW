import { Loaded } from "@mikro-orm/core";
import { PartitionNames } from "@scow/scow-resource-protos/generated/resource/partition";
import { AccountClusterRule } from "src/server/entities/AccountClusterRule";
import { AccountPartitionRule } from "src/server/entities/AccountPartitionRule";
import { TenantClusterRule } from "src/server/entities/TenantClusterRule";
import { TenantPartitionRule } from "src/server/entities/TenantPartitionRule";
import { callHook } from "src/server/hookClient";

import { forkEntityManager } from "./getOrm";
import { logger } from "./logger";
import { USE_MOCK } from "./processEnv";

/**
 * 获取账户列表的已授权集群
 * @param accountNames
 * @param tenantName
 * @returns
 */
export async function getAccountsAssignedClusters(accountNames: string[], tenantName: string):
Promise<string[]> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    return ["hpc01"];
  }

  const em = await forkEntityManager();
  const results = await em.find(AccountClusterRule, { tenantName, accountName: { $in: accountNames } });

  const clusterIds = results.map((item) => (item.clusterId));
  const uniqueClusterIds = clusterIds.reduce<string[]>((acc, id) => {
    if (!acc.includes(id)) {
      acc.push(id);
    }
    return acc;
  }, []);
  return uniqueClusterIds;
}

/**
 * 获取账户的某集群下的已授权分区
 * @param accountName
 * @param tenantName
 * @param clusterId
 * @returns
 */
export async function getAccountAssignedPartitionsInCluster(
  accountName: string, tenantName: string, clusterId: string):
  Promise<string[]> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    return ["compute1", "compute2"];
  }

  const em = await forkEntityManager();
  const found = await em.find(AccountPartitionRule, { accountName, tenantName, clusterId });

  return found.map((item) => item.partition);
}

/**
 * 获取账户集群下的已授权分区
 * @param accountNames
 * @param tenantName
 * @returns
 */
export async function getAccountsAssignedClusterPartitions(
  accountNames: string[], tenantName: string):
  Promise<Record<string, PartitionNames>> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    return {
      "hpc01": { partitionNames: ["compute1", "compute2"]},
    };
  }

  const em = await forkEntityManager();

  // 获取集群
  const foundClusters = await em.find(AccountClusterRule, {
    accountName: { $in: accountNames }, tenantName });
  // 获取分区
  const foundPartitions = await em.find(AccountPartitionRule, {
    accountName: { $in: accountNames }, tenantName });

  const results = mapToClusterPartitions(foundClusters, foundPartitions);

  return results;
}

/**
 * 获取租户已授权的集群和分区
 * @param tenantName
 * @returns
 */
export async function getTenantAssignedClusterPartitions(tenantName: string):
Promise<Record<string, PartitionNames>> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    return {
      "hpc01": { partitionNames: ["compute1", "compute2"]},
    };
  }

  const em = await forkEntityManager();

  const foundClusters = await em.find(TenantClusterRule, { tenantName });
  const foundPartitions = await em.find(TenantPartitionRule, { tenantName });
  const results = mapToClusterPartitions(foundClusters, foundPartitions);

  return results;
}

/**
 * 给账户写入默认授权的集群授权信息和分区信息
 * @param accountName
 * @param tenantName
 */
export async function assignCreatedAccount(accountName: string, tenantName: string):
Promise<boolean> {

  const em = await forkEntityManager();
  // 获取租户下设置的账户默认授权的集群和分区
  const foundDefaultClusters = await em.find(TenantClusterRule, { tenantName, isAccountDefaultCluster: true });
  const foundDefaultPartitions = await em.find(TenantPartitionRule, { tenantName, isAccountDefaultPartition: true });

  const foundDefaultClusterIds = foundDefaultClusters.map((item) => (item.clusterId));
  foundDefaultClusterIds.forEach((clusterId) => {
    const accountCluster = new AccountClusterRule({
      accountName,
      tenantName,
      clusterId,
    });
    em.persist(accountCluster);
  });

  foundDefaultPartitions.forEach((item) => {
    const accountPartition = new AccountPartitionRule({
      accountName,
      tenantName,
      clusterId: item.clusterId,
      partition: item.partition,
    });
    em.persist(accountPartition);
  });

  await em.flush();

  // 通知账户授权集群数据
  await callHook("accountAssignedToClusters",
    { accountName, tenantName, clusterIds: foundDefaultClusterIds }, logger);

  return true;
}

/**
 * 提交作业/交互式应用时 选择集群后过滤已授权账户
 * @param clusterId
 * @param tenantName
 */
export async function getClusterAssignedAccountsData(clusterId: string, tenantName: string):
Promise<string[]> {

  const em = await forkEntityManager();
  const found = await em.find(AccountClusterRule, { clusterId, tenantName });

  return found.map((item) => item.accountName);
}


function mapToClusterPartitions(
  clustersInfo: Loaded<AccountClusterRule>[] | Loaded<TenantClusterRule>[],
  partitionsInfo: Loaded<AccountPartitionRule>[] | Loaded<TenantPartitionRule>[],
): Record<string, PartitionNames> {

  const results: Record<string, PartitionNames> = {};

  // 遍历已获取的集群信息，将它们添加到结果集中
  clustersInfo.forEach((cluster) => {
    results[cluster.clusterId] = { partitionNames: []};
  });

  // 遍历已获取的分区信息，根据集群名将分区名称添加到结果集中
  partitionsInfo.forEach((partition) => {
    if (results[partition.clusterId]) {
      results[partition.clusterId].partitionNames.push(partition.partition);
    }
  });

  return results;
}


