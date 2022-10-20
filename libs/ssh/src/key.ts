import fs from "fs";
import { join } from "path";
import type { Logger } from "ts-log";

import { sftpChmod, sftpChown, sftpWriteFile } from "./sftp";
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
export async function insertKey(
  user: string, host: string, rootKeyPair: KeyPair, logger: Logger,
) {
  // https://superuser.com/a/484280
  logger.info("Adding key to user %s to %s", user, host);

  await sshConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    const homeDir = await ssh.execCommand(`eval echo ~${user}`);
    const userID = await ssh.execCommand(`id -u ${user}`);
    const userGID = await ssh.execCommand(`id -g ${user}`);

    const userHomeDir = homeDir.stdout.trim();

    const sftp = await ssh.requestSFTP();
    // make sure user home directory exists.
    await ssh.mkdir(userHomeDir, undefined, sftp);

    const sshDir = join(userHomeDir, ".ssh");

    await ssh.mkdir(sshDir, undefined, sftp);
    // root create the directory, so we need to change the owner
    await sftpChown(sftp)(userHomeDir, Number(userID.stdout.trim()), Number(userGID.stdout.trim()));

    const keyFilePath = join(sshDir, "authorized_keys");
    await sftpChmod(sftp)(sshDir, "700");
    await sftpWriteFile(sftp)(keyFilePath, rootKeyPair.publicKey);
    logger.info("Writing key to user %s, userID %s to %s in file %s", user, userID, host, keyFilePath);

    await sftpChmod(sftp)(keyFilePath, "644");

    await sftpChown(sftp)(sshDir, Number(userID.stdout.trim()), Number(userGID.stdout.trim()));

    await sftpChown(sftp)(keyFilePath, Number(userID.stdout.trim()), Number(userGID.stdout.trim()));

  });
}

