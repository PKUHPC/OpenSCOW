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

import { Code, ConnectError } from "@connectrpc/connect";
import { ServiceError, status } from "@grpc/grpc-js";
import { ScowResourceConfigSchema } from "@scow/config/build/common";

import { getScowResourceClient } from "./client";

// 映射 tRPC 状态码到 gRPC 状态码的函数
function mapTRPCStatusToGRPC(statusCode: Code): status {
  switch (statusCode) {
    case Code.Canceled:
      return status.CANCELLED;
    case Code.Unknown:
      return status.UNKNOWN;
    case Code.InvalidArgument:
      return status.INVALID_ARGUMENT;
    case Code.DeadlineExceeded:
      return status.DEADLINE_EXCEEDED;
    case Code.NotFound:
      return status.NOT_FOUND;
    case Code.AlreadyExists:
      return status.ALREADY_EXISTS;
    case Code.PermissionDenied:
      return status.PERMISSION_DENIED;
    case Code.ResourceExhausted:
      return status.RESOURCE_EXHAUSTED;
    case Code.FailedPrecondition:
      return status.FAILED_PRECONDITION;
    case Code.Aborted:
      return status.ABORTED;
    case Code.OutOfRange:
      return status.OUT_OF_RANGE;
    case Code.Unimplemented:
      return status.UNIMPLEMENTED;
    case Code.Internal:
      return status.INTERNAL;
    case Code.Unavailable:
      return status.UNAVAILABLE;
    case Code.DataLoss:
      return status.DATA_LOSS;
    case Code.Unauthenticated:
      return status.UNAUTHENTICATED;
    default:
      return status.OK;
  }
}

// 映射 tRPC 异常到 gRPC 异常的函数
export function mapTRPCExceptionToGRPC(err: any): ServiceError {
  if (err instanceof ConnectError) {
    return { code: mapTRPCStatusToGRPC(err.code), details: err.message } as ServiceError;
  }

  return {
    code: status.UNKNOWN,
    details: "An unknown error occurred.",
  } as ServiceError;
}

// 获取用户关联账户的已授权集群
export async function getUserAccountsClusterIds(
  // misDeployed: boolean,
  scowResourceConfig: ScowResourceConfigSchema,
  userAccounts: string[] | undefined,
  tenantName: string | undefined): Promise<string[]> {

  const resourceClient = getScowResourceClient(scowResourceConfig.address);

  const clusters =
    await resourceClient.resource.getAccountsAssignedClusterIds({ accountNames: userAccounts, tenantName });

  return clusters.assignedClusterIds;
};


// 获取用户关联账户的已授权集群和分区
export async function getUserAccountsClusterPartitions(
  scowResourceConfig: ScowResourceConfigSchema,
  userAccounts: string[] | undefined,
  tenantName: string | undefined): Promise<Record<string, string[]>> {

  const resourceClient = getScowResourceClient(scowResourceConfig.address);

  const clusters =
    await resourceClient.resource.getAccountsAssignedClustersAndPartitions({ accountNames: userAccounts, tenantName });

  return Object.entries(clusters.assignedClusterPartitions).reduce((acc, [key, value]) => {
    acc[key] = value.partitionNames;
    return acc;
  }, {});
};


// 获取用户关联账户的已授权集群和分区
export async function getClusterAssignedAccounts(
  scowResourceConfig: ScowResourceConfigSchema,
  clusterId: string,
  tenantName: string): Promise<string[]> {

  const resourceClient = getScowResourceClient(scowResourceConfig.address);

  const result =
    await resourceClient.resource.getClusterAssignedAccounts({ clusterId, tenantName });

  return result.accountNames;
};