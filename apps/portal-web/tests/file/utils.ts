import { sftpWriteFile, sshRawConnect, sshRmrf } from "@scow/lib-ssh";
import { randomBytes } from "crypto";
import FormData from "form-data";
import { createMocks, RequestOptions } from "node-mocks-http";
import { NodeSSH } from "node-ssh";
import path from "path";
import { TOKEN_KEY } from "src/auth/cookie";
import { runtimeConfig } from "src/utils/config";
import { SFTPWrapper } from "ssh2";

const target = "localhost:22222";
const user = "test";
export const CLUSTER = "hpc01";
export const TEST_COOKIE = { [TOKEN_KEY]: "123" };

export interface TestServer {
  ssh: NodeSSH;
  sftp: SFTPWrapper;
}

export const connectToTestServer = async () => {

  const ssh = await sshRawConnect(target, user, runtimeConfig.SSH_PRIVATE_KEY_PATH);

  return { ssh, sftp: await ssh.requestSFTP() } as TestServer;
};

export const resetTestServer = async (server: TestServer) => {
  const base = baseFolder();

  await sshRmrf(server.ssh, path.dirname(base));
  server.ssh.dispose();
};

export async function createFile(sftp: SFTPWrapper, filePath: string) {
  await sftpWriteFile(sftp)(filePath, randomBytes(10));
}

const baseFolder = () => `tests/testFolder${process.env.JEST_WORKER_ID}/${user}`;

export function actualPath(filename: string) {
  return path.join(baseFolder(), filename);
}

// returns base folder
export async function createTestItems({ sftp, ssh }: TestServer): Promise<string> {
  const base = baseFolder();
  await ssh.mkdir(path.join(base, "dir1"), undefined, sftp);
  await createFile(sftp, path.join(base, "test1"));

  return base;
}

export async function call(route: (req, res) => any, params: RequestOptions) {
  const { req, res } = createMocks({ cookies: TEST_COOKIE, ...params });
  await route(req, res);

  return { req, res };
}

export function mockFileForm(size: number, filename: string) {
  const formData = new FormData();

  formData.append("file", Buffer.alloc(size, 1), {
    filename,
    contentType: "application/pdf",
    knownLength: size,
  });
  return formData;
}

