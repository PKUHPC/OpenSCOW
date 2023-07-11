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
import { getLoginNode } from "@scow/config/build/cluster";
import { SftpError, sshConnect as libConnect, SshConnectError, testRootUserSshLogin } from "@scow/lib-ssh";
import type { NodeSSH } from "node-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { scowErrorMetadata } from "src/utils/error";
import { Logger } from "ts-log";


export function getClusterLoginNode(cluster: string): string | undefined {
  const loginNode = getLoginNode(clusters[cluster]?.loginNodes?.[0]);
  return loginNode?.address;
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
  await Promise.all(Object.values(clusters).map(async ({ displayName, loginNodes }) => {
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
