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

import { randomBytes } from "crypto";
import { NodeSSH } from "node-ssh";
import { homedir } from "os";
import { dirname, join } from "path";
import { getKeyPair } from "src/key";
import { sftpWriteFile, sshRmrf } from "src/sftp";
import { sshRawConnect } from "src/ssh";
import { SFTPWrapper } from "ssh2";

export const target = "localhost:22222";
export const rootUserId = "root";
export const testUserId = "test";
export const testUserPassword = "1234";

export interface TestSshServer {
  ssh: NodeSSH;
  sftp: SFTPWrapper;
}

const SSH_PRIVATE_KEY_PATH = join(homedir(), ".ssh", "id_rsa");
const SSH_PUBLIC_KEY_PATH = join(homedir(), ".ssh", "id_rsa.pub");

export const rootKeyPair = getKeyPair(SSH_PRIVATE_KEY_PATH, SSH_PUBLIC_KEY_PATH);

export const connectToTestServerAsRoot = async () => {

  const ssh = await sshRawConnect(target, rootUserId, rootKeyPair, console);

  return { ssh, sftp: await ssh.requestSFTP() } as TestSshServer;
};

export const resetTestServerAsRoot = async (server: TestSshServer) => {
  const base = baseFolder();

  await sshRmrf(server.ssh, dirname(base));
  server.ssh.dispose();
};

export async function createFile(sftp: SFTPWrapper, filePath: string) {
  await sftpWriteFile(sftp)(filePath, randomBytes(10));
}

const baseFolder = () => `tests/testFolder${process.env.JEST_WORKER_ID}/${rootUserId}`;

// returns base folder
export async function createTestItems({ sftp, ssh }: TestSshServer): Promise<string> {
  const base = baseFolder();
  await ssh.mkdir(join(base, "dir1"), undefined, sftp);
  const test1 = join(base, "test1");
  await createFile(sftp, test1);

  return base;
}

