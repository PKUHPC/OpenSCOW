import { Code, ConnectError } from "@connectrpc/connect";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getLoginNode } from "@scow/config/build/cluster";
import { getScowdClient as getClient, ScowdClient } from "@scow/lib-scowd/build/client";
import { createScowdCertificates } from "@scow/lib-scowd/build/ssl";
import { removePort } from "@scow/utils";
import { configClusters } from "src/config/clusters";
import { config } from "src/config/env";

export const scowdClientNotFound = (cluster: string) => {
  return { code: Status.NOT_FOUND, message: `The scowd client on cluster ${cluster} was not found` } as ServiceError;
};
export const certificates = createScowdCertificates(config);

export function generateScowdUrl(address: string, scowdPort: number | undefined) {
  return config.SCOWD_SSL_ENABLED
    ? `https://${removePort(address)}:${scowdPort}` : `http://${removePort(address)}:${scowdPort}`;
}

export function getLoginNodeScowdUrl(cluster: string, host: string): string | undefined {
  const loginNode = getLoginNodeFromAddress(cluster, host);

  if (!loginNode) return undefined;

  const { address, scowdPort } = loginNode;

  return generateScowdUrl(address, scowdPort);
}

const scowdClientForClusters = Object.entries(configClusters).reduce((prev, [cluster]) => {
  const clusterInfo = configClusters[cluster];
  const loginNode = getLoginNode(clusterInfo?.loginNodes?.[0]);
  const scowdUrl = getLoginNodeScowdUrl(cluster, loginNode.address);
  if (!clusterInfo.scowd?.enabled || !loginNode.scowdPort || !scowdUrl) {
    prev[cluster] = undefined;
  } else {
    const client = getClient(scowdUrl, certificates);
    prev[cluster] = client;
  }
  return prev;
}, {} as Record<string, ScowdClient | undefined>);

export const getScowdClient = (cluster: string) => {
  const client = scowdClientForClusters[cluster];
  if (!client) { throw scowdClientNotFound(cluster); }

  return client;
};

export function getLoginNodeFromAddress(cluster: string, address: string) {
  const clusterInfo = configClusters[cluster];
  const loginNodes = clusterInfo?.loginNodes.map(getLoginNode);
  const loginNode = loginNodes.find((loginNode) => loginNode.address === address);

  return loginNode;
}

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
