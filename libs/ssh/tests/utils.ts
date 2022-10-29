import { randomBytes } from "crypto";
import { NodeSSH } from "node-ssh";
import { homedir } from "os";
import { join } from "path";
import { getKeyPair } from "src/key";
import { sftpWriteFile, sshRmrf } from "src/sftp";
import { sshRawConnect } from "src/ssh";
import { SFTPWrapper } from "ssh2";

const target = "localhost:22222";
export const rootUserId = "root";

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

  await sshRmrf(server.ssh, path.dirname(base));
  server.ssh.dispose();
};

export async function createFile(sftp: SFTPWrapper, filePath: string) {
  await sftpWriteFile(sftp)(filePath, randomBytes(10));
}

const baseFolder = () => `tests/testFolder${process.env.JEST_WORKER_ID}/${rootUserId}`;

// returns base folder
export async function createTestItems({ sftp, ssh }: TestSshServer): Promise<string> {
  const base = baseFolder();
  await ssh.mkdir(path.join(base, "dir1"), undefined, sftp);
  const test1 = path.join(base, "test1");
  await createFile(sftp, test1);

  return base;
}

