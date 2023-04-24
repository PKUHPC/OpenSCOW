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

import fs from "fs";
import { join } from "path";
import type { Logger } from "ts-log";

import { sftpAppendFile, sftpChmod, sftpChown, sftpStatOrUndefined, sftpWriteFile } from "./sftp";
import { sshConnect } from "./ssh";
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function getKeyPair(privateKeyPath: string, publicKeyPath: string): KeyPair {
  return {
    privateKey: fs.readFileSync(privateKeyPath, "utf-8").trim(),
    publicKey: fs.readFileSync(publicKeyPath, "utf-8").trim(),
  };
}

/**
 * Insert the host's public key to the user's authorized_keys to enable public key login
 *
 * @param user the user
 * @param host the host of machine
 * @param rootKeyPair the key pair of root
 * @param logger the logger
 */
export async function insertKeyAsRoot(
  user: string, host: string, rootKeyPair: KeyPair, logger: Logger,
) {
  // https://superuser.com/a/484280
  logger.info("Adding key to user %s to %s", user, host);

  await sshConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    const homeDir = await ssh.execCommand(`eval echo ~${user}`);
    const userID = await ssh.execCommand(`id -u ${user}`);
    const userGID = await ssh.execCommand(`id -g ${user}`);

    const uid = Number(userID.stdout.trim());
    const gid = Number(userGID.stdout.trim());

    const userHomeDir = homeDir.stdout.trim();

    const sftp = await ssh.requestSFTP();

    // make sure user home directory exists.
    await ssh.mkdir(userHomeDir, undefined, sftp);
    // root create the directory, so we need to change the owner
    await sftpChown(sftp)(userHomeDir, uid, gid);

    // make sure .ssh dir exists
    const sshDir = join(userHomeDir, ".ssh");
    const sshDirStat = await sftpStatOrUndefined(sftp)(sshDir);
    if (!sshDirStat) {
      logger.info("%s not exists in %s user %s. Creating it.", sshDir, host, user);
      await ssh.mkdir(sshDir, undefined, sftp);
      await sftpChmod(sftp)(sshDir, "700");
      await sftpChown(sftp)(sshDir, uid, gid);
    }

    // insert key
    const keyFilePath = join(sshDir, "authorized_keys");
    const keyFileStat = await sftpStatOrUndefined(sftp)(keyFilePath);
    if (!keyFileStat) {
      logger.info("Writing key to user %s, userID %s to %s in file %s", user, uid, host, keyFilePath);
      await sftpWriteFile(sftp)(keyFilePath, rootKeyPair.publicKey + "\n");
      await sftpChmod(sftp)(keyFilePath, "644");
      await sftpChown(sftp)(keyFilePath, uid, gid);
    } else {
      logger.info("%s exists for user %s in %s. Appending public key", keyFilePath, user, host);
      await sftpAppendFile(sftp)(keyFilePath, "\n" + rootKeyPair.publicKey + "\n");
    }
  });
}

