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

import { sftpChmod } from "@scow/lib-ssh";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";
import { Logger } from "ts-log";


const SHELL_FILE_LOCAL = "assets/scow-shell-file.sh";
const PROFILE_DIRECTORY = "/etc/profile.d";
const SHELL_FILE_REMOTE = "/etc/profile.d/scow-shell-file.sh";


export async function initShellFile(cluster: string, logger: Logger) {

  const address = getClusterLoginNode(cluster).address;
  if (!address) { throw new Error(`Cluster ${cluster} has no login node`); }

  return await sshConnect(address, "root", logger, async (ssh) => {
    // make sure directory /etc/profile.d exists.
    await ssh.mkdir(PROFILE_DIRECTORY);
    const sftp = await ssh.requestSFTP();

    await ssh.putFile(SHELL_FILE_LOCAL, SHELL_FILE_REMOTE);
    await sftpChmod(sftp)(SHELL_FILE_REMOTE, "755");
    logger.info(`Copy scow-shell-file.sh to the ${SHELL_FILE_REMOTE} of the login node of cluster ${cluster}.`);
  });
}
