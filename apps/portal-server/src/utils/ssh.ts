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

import { ServiceError } from "@ddadaal/tsgrpc-common";
import { status } from "@grpc/grpc-js";
import { SftpError, sshConnect as libConnect, SshConnectError, testRootUserSshLogin } from "@scow/lib-ssh";
import { NodeSSH } from "node-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { scowErrorMetadata } from "src/utils/error";
import { loginNodeNotFound, transferNodeNotFound, transferNotEnabled } from "src/utils/errors";
import { Logger } from "ts-log";

interface NodeNetInfo {
  address: string,
  host: string,
  port: number,
}

export function getClusterLoginNode(cluster: string): string {
  const loginNode = clusters[cluster]?.slurm?.loginNodes?.[0];
  if (!loginNode) {
    throw loginNodeNotFound(cluster);
  }
  return loginNode;
}

export function getClusterTransferNode(cluster: string): NodeNetInfo {
  const enabled = clusters[cluster]?.crossClusterFilesTransfer?.enabled;
  const transferNode = clusters[cluster]?.crossClusterFilesTransfer?.transferNode;
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
  const enabled = clusters[cluster]?.crossClusterFilesTransfer?.enabled;
  const transferNode = clusters[cluster]?.crossClusterFilesTransfer?.transferNode;
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
        metadata: scowErrorMetadata(SSH_ERROR_CODE),
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
export async function checkClustersRootUserLogin(logger: Logger) {
  await Promise.all(Object.values(clusters).map(async ({ displayName, slurm: { loginNodes } }) => {
    const node = loginNodes[0];
    logger.info("Checking if root can login to %s by login node %s", displayName, node);
    const error = await testRootUserSshLogin(node, rootKeyPair, console);
    if (error) {
      logger.info("Root cannot login to %s by login node %s. err: %o", displayName, node, error);
      throw error;
    } else {
      logger.info("Root can login to %s by login node %s", displayName, node);
    }
  }));
}

