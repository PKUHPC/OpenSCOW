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

import { NodeSSH, SSHExecCommandOptions } from "node-ssh";
import { join } from "path";
import { quote } from "shell-quote";
import type { Logger } from "ts-log";

import { insertKeyAsRoot, KeyPair } from "./key";
import { sftpChmod, sftpMkdir, sftpStat, sftpWriteFile } from "./sftp";

export class SshConnectError extends Error {
  constructor(options?: ErrorOptions) {
    super("Error when connecting to remote", options);
  }
}

/**
 * Connect to SSH and returns the SSH Object
 * Must dispose of the object after use
 *
 * If the username is not root and first login attempt failed,
 * it inserts the public key into the user's authorized_key and logs in again
 *
 * @param address address
 * @param username  username
 * @param rootKeyPair the ssh key pair of root user
 * @param logger logger
 * @returns SSH Object
 */
export async function sshRawConnect(address: string, username: string, rootKeyPair: KeyPair, logger: Logger) {
  const [host, port] = address.split(":");
  const ssh = new NodeSSH();

  async function connect() {
    await ssh.connect({ host, port: port ? +port : undefined, username, privateKey: rootKeyPair.privateKey });
  }

  try {
    await connect();
  } catch (e) {
    if (username === "root") {
      logger.info("Login to %s as %s failed.", host, username);
      throw e;
    }

    logger.info("Login to %s as %s failed. Try inserting public key", host, username);
    await insertKeyAsRoot(username, address, rootKeyPair, logger);
    await connect().catch((e) => {
      logger.error(e, "Error when ssh connecting to remote");
      throw new SshConnectError({ cause: e });
    });
  }

  return ssh;
}

/**
 * Connect to SSH by password and returns the SSH Object
 * Must dispose of the object after use
 *
 * @param address address
 * @param username  username
 * @param password password of the user
 * @param logger logger
 * @returns SSH Object
 */
export async function sshRawConnectByPassword(address: string, username: string, password: string, logger: Logger) {
  const [host, port] = address.split(":");
  const ssh = new NodeSSH();

  async function connect() {
    await ssh.connect({ host, port: port ? +port : undefined, username, password: password });
  }

  try {
    await connect();
  } catch (e) {
    logger.info("Login to %s as %s by password failed.", host, username);
    throw e;
  }

  return ssh;
}


export async function sshConnect<T>(
  address: string, username: string, rootKeyPair: KeyPair, logger: Logger,
  run: (ssh: NodeSSH) => Promise<T>,
) {
  const ssh = await sshRawConnect(address, username, rootKeyPair, logger);

  return run(ssh).finally(() => { ssh.dispose(); });
}

export async function sshConnectByPassword<T>(
  address: string, username: string, password: string, logger: Logger,
  run: (ssh: NodeSSH) => Promise<T>,
) {
  const ssh = await sshRawConnectByPassword(address, username, password, logger);

  return run(ssh).finally(() => { ssh.dispose(); });
}

/**
 * Construct a command with env prefixes.
 * Some OpenSSH servers don't accept envs
 * This is a workaround by combining the envs to the command
 * @param cmd the command
 * @param parameters the command parameters
 * @param env env
 * @returns command with env prefixes
 */
export function constructCommand(cmd: string, parameters: readonly string[], env?: Record<string, string>) {

  const command = cmd + (parameters.length > 0 ? (" " + quote(parameters)) : "");

  const envPrefix = env ? Object.keys(env).map((x) => `${x}=${quote([env[x] ?? ""])} `).join("") : "";

  return envPrefix + command;
}

export async function loggedExec(ssh: NodeSSH, logger: Logger, throwIfFailed: boolean,
  cmd: string, parameters: string[], options?: SSHExecCommandOptions) {

  const env = options?.execOptions?.env as Record<string, string>;

  const command = constructCommand(cmd, parameters, env);

  const resp = await ssh.execCommand(command, options);

  if (resp.code !== 0) {
    logger.error("Command %o failed. stdout %s, stderr %s", command, resp.stdout, resp.stderr);
    if (throwIfFailed) {
      throw new Error("");
    }
  } else {
    logger.debug("Command %o completed. stdout %s, stderr %s", command, resp.stdout, resp.stderr);
  }
  return resp;
}

/**
 * Check if the root user can log in to the host
 * If fails, return the error
 *
 * @param host the host
 * @param keyPair key pair
 * @param logger logger
 * @returns the error if login failed
 */
export async function testRootUserSshLogin(host: string, keyPair: KeyPair, logger: Logger) {
  return await sshConnect(host, "root", keyPair, logger, async () => undefined).catch((e) => e);

}

/**
 * Login as user by password and insert the host's public key to the user's authorized_keys to enable public key login
 *
 * @param address the address
 * @param username the username
 * @param pwd password
 * @param rootKeyPair key pair
 * @param logger logger
 */
export async function insertKeyAsUser(
  address: string, username: string, pwd: string,
  rootKeyPair: KeyPair, logger: Logger,
) {

  await sshConnectByPassword(address, username, pwd, logger, async (ssh) => {
    const homeDir = await ssh.execCommand(`eval echo ~${username}`);
    const userHomeDir = homeDir.stdout.trim();

    const sftp = await ssh.requestSFTP();
    const stat = await sftpStat(sftp)(userHomeDir).catch(() => undefined);

    if (!stat) {
      logger.warn("Home directory %s of user %s doesn't exist even after login as the user. Insert key as root.",
        userHomeDir, username);

      await insertKeyAsRoot(username, address, rootKeyPair, logger);
      return;
    }

    // make sure user home dir is a directory
    if (!stat.isDirectory()) {
      throw new Error(`${userHomeDir} of user ${username} exists but is not a directory`);
    }

    // creat ~/.ssh/authorized_keys and write keys
    const sshDir = join(userHomeDir, ".ssh");
    await sftpMkdir(sftp)(sshDir);
    await sftpChmod(sftp)(sshDir, "700");

    const keyFilePath = join(sshDir, "authorized_keys");
    await sftpWriteFile(sftp)(keyFilePath, rootKeyPair.publicKey);
    logger.info("Writing key for user %s to %s in file %s", username, address, keyFilePath);
    await sftpChmod(sftp)(keyFilePath, "644");
  });
}

