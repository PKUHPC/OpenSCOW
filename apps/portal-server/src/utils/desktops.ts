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

import { executeAsUser, getUserHomedir, sftpExists, sftpReadFile, sftpWriteFile } from "@scow/lib-ssh";
import { Desktop } from "@scow/protos/build/portal/desktop";
import { NodeSSH } from "node-ssh";
import { join } from "path";
import { portalConfig } from "src/config/portal";
import { sshConnect } from "src/utils/ssh";
import { parseListOutput, VNCSERVER_BIN_PATH } from "src/utils/turbovnc";
import { Logger } from "ts-log";

/**
 * Get desktops file path of user
 * @param ssh ssh object connected as root
 * @param userId  user id
 * @param logger  logger
 * @returns desktops file path
 */
export async function getUserDesktopsFilePath(ssh: NodeSSH, userId: string, logger: Logger): Promise<string> {
  const userHomeDir = await getUserHomedir(ssh, userId, logger);
  const userDesktopDir = join(userHomeDir, portalConfig.desktopsDir);
  // make sure desktopsDir exists
  await ssh.mkdir(userDesktopDir);
  return join(userDesktopDir, "desktops.json");
}

/**
 * Read desktops file of user
 * @param ssh ssh object connected as root
 * @param userId user id
 * @param logger logger
 * @returns desktops
 */
async function readDesktopsFile(ssh: NodeSSH, userId: string, logger: Logger): Promise<Desktop[]> {
  const desktopFilePath = await getUserDesktopsFilePath(ssh, userId, logger);
  const sftp = await ssh.requestSFTP();
  if (await sftpExists(sftp, desktopFilePath)) {
    const content = await sftpReadFile(sftp)(desktopFilePath);
    return JSON.parse(content.toString()) as Desktop[];
  }
  return [];
}

/**
 * Wire desktops file of user
 * @param ssh ssh object connected as root
 * @param userId user id
 * @param desktops desktops
 * @param logger logger
 */
async function writeDesktopsFile(ssh: NodeSSH, userId: string, desktops: Desktop[], logger: Logger): Promise<void> {
  const desktopFilePath = await getUserDesktopsFilePath(ssh, userId, logger);
  const sftp = await ssh.requestSFTP();
  await sftpWriteFile(sftp)(desktopFilePath, JSON.stringify(desktops));
}

/**
 *
 * @param host loginode
 * @param userId user id
 * @param logger logger
 * @returns userDesktops
 */
export async function listDesktopsFromHost(host: string, userId: string, logger: Logger) {
  return await sshConnect(host, "root", logger, async (ssh) => {

    // list all running session
    const resp = await executeAsUser(ssh, userId, logger, true,
      VNCSERVER_BIN_PATH, ["-list"],
    );

    const ids = parseListOutput(resp.stdout);

    const desktops = await readDesktopsFile(ssh, userId, logger);

    const runningDesktops: Desktop[] = ids.map((id) => {
      const desktop = desktops.find((x) => x.displayId === id);
      return {
        displayId: id,
        desktopName: desktop ? desktop.desktopName : "",
        wm: desktop ? desktop.wm : "",
        createTime: desktop ? desktop.createTime : undefined,
      };
    });
    return {
      host,
      desktops: runningDesktops,
    };
  });
}


/**
 * @param ssh ssh object connected as root
 * @param userId user id
 * @param deskTopInfo desktop info to add
 * @param logger logger
 */
export async function addDesktopToFile(
  ssh: NodeSSH,
  userId: string,
  deskTopInfo: Desktop,
  logger: Logger,
): Promise<void> {

  const desktops = await readDesktopsFile(ssh, userId, logger);

  desktops.push(deskTopInfo);

  await writeDesktopsFile(ssh, userId, desktops, logger);
  logger.info(`Desktop ${deskTopInfo.desktopName} added`);
}

/**
 * @param ssh ssh object connected as root
 * @param userId user id
 * @param displayId display id of desktop to remove
 * @param logger logger
 */
export async function removeDesktopFromFile(
  ssh: NodeSSH,
  userId: string,
  displayId: number,
  logger: Logger,
): Promise<void> {

  const desktops = await readDesktopsFile(ssh, userId, logger);

  const index = desktops.findIndex((desktop) => desktop.displayId === displayId);
  if (index !== -1) {
    const removedDesktop = desktops[index];
    desktops.splice(index, 1);
    await writeDesktopsFile(ssh, userId, desktops, logger);
    logger.info(`Desktop ${removedDesktop.desktopName} removed`);
  }
}
