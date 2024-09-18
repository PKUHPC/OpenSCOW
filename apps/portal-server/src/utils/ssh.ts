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

import { ServiceError } from "@ddadaal/tsgrpc-common";
import { status } from "@grpc/grpc-js";
import { ClusterConfigSchema, getLoginNode } from "@scow/config/build/cluster";
import { scowErrorMetadata } from "@scow/lib-server/build/error";
import { SftpError, sshConnect as libConnect, SshConnectError, testRootUserSshLogin } from "@scow/lib-ssh";
import { NodeSSH } from "node-ssh";
import { configClusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { Logger } from "ts-log";

import { clusterNotFound, loginNodeNotFound, transferNodeNotFound, transferNotEnabled } from "./errors";

interface NodeNetInfo {
  address: string,
  host: string,
  port: number,
}

// 获取配置文件集群中各节点信息
export function getConfigClusterLoginNode(cluster: string): string | undefined {
  const loginNode = getLoginNode(configClusters[cluster]?.loginNodes?.[0]);
  return loginNode?.address;
}

// 获取集群中各节点信息
export function getClusterLoginNode(cluster: string): string | undefined {
  const loginNode = getLoginNode(configClusters[cluster]?.loginNodes?.[0]);
  return loginNode?.address;
}

export function getClusterTransferNode(cluster: string): NodeNetInfo {
  const enabled = configClusters[cluster]?.crossClusterFileTransfer?.enabled;
  const transferNode = configClusters[cluster]?.crossClusterFileTransfer?.transferNode;
  if (!enabled) {
    throw transferNotEnabled(cluster);
  }
  else if (!transferNode) {
    throw transferNodeNotFound(cluster);
  }
  // 解析为host, port
  const [host, port] = transferNode.indexOf(":") > 0 ?
    [transferNode.split(":")[0], parseInt(transferNode.split(":")[1])] :
    [transferNode, 22];
  const address = `${host}:${port}`;
  return {
    address: address,
    host: host,
    port: port,
  };
}

export function tryGetClusterTransferNode(cluster: string): NodeNetInfo | undefined {
  const enabled = configClusters[cluster]?.crossClusterFileTransfer?.enabled;
  const transferNode = configClusters[cluster]?.crossClusterFileTransfer?.transferNode;
  if (!enabled) {
    return undefined;
  }
  else if (!transferNode) {
    return undefined;
  }
  // 解析为host, port
  const [host, port] = transferNode.indexOf(":") > 0 ?
    [transferNode.split(":")[0], parseInt(transferNode.split(":")[1])] :
    [transferNode, 22];
  const address = `${host}:${port}`;
  return {
    address: address,
    host: host,
    port: port,
  };
}

export const SSH_ERROR_CODE = "SSH_ERROR";
export const SFTP_ERROR_CODE = "SFTP_ERROR";

export async function sshConnect<T>(
  address: string, username: string, logger: Logger, run: (ssh: NodeSSH) => Promise<T>,
): Promise<T> {
  return libConnect(address, username, rootKeyPair, logger, run).catch((e) => {

    if (e instanceof SshConnectError) {
      throw new ServiceError({
        code: status.INTERNAL,
        details: e.message,
        message: e.message,
        metadata: scowErrorMetadata(SSH_ERROR_CODE, typeof e.cause === "string"
          ? e.cause.length > 150
            ? { cause: encodeURIComponent(e.cause.substring(0, 150) + "...") }
            : { cause: encodeURIComponent(e.cause) }
          : undefined),
      });
    }

    if (e instanceof SftpError) {
      throw new ServiceError({
        code: status.UNKNOWN,
        details: e.message,
        message: e.message,
        metadata: scowErrorMetadata(SFTP_ERROR_CODE),
      });
    }

    throw e;
  });
}

/**
 * Check whether all clusters can be logged in as root user
 */
export async function checkClustersRootUserLogin(
  logger: Logger,
  activatedClusters: Record<string, ClusterConfigSchema>,
) {
  await Promise.all(Object.values(activatedClusters).map(async ({ displayName, loginNodes }) => {
    const node = getLoginNode(loginNodes[0]);
    logger.info("Checking if root can login to %s by login node %s", displayName, node.name);
    const error = await testRootUserSshLogin(node.address, rootKeyPair, console);
    if (error) {
      logger.info("Root cannot login to %s by login node %s. err: %o", displayName, node.name, error);
      throw error;
    } else {
      logger.info("Root can login to %s by login node %s", displayName, node.name);
    }
  }));
}

/**
 * Check whether login node is in current cluster
 */
export function checkLoginNodeInCluster(cluster: string, loginNode: string) {
  const loginNodes = configClusters[cluster]?.loginNodes.map(getLoginNode);
  if (!loginNodes) {
    throw clusterNotFound(cluster);
  }
  if (!loginNodes.map((x) => x.address).includes(loginNode)) {
    throw loginNodeNotFound(loginNode);
  }
}
