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

import { ServiceError } from "@grpc/grpc-js";
import { sftpWriteFile, sshRawConnect, sshRmrf } from "@scow/lib-ssh";
import { SubmissionInfo } from "@scow/protos/build/portal/app";
import { randomBytes } from "crypto";
import FormData from "form-data";
import { NodeSSH } from "node-ssh";
import path, { join } from "path";
import { rootKeyPair } from "src/config/env";
import { DesktopInfo } from "src/utils/desktops";
import { SFTPWrapper } from "ssh2";

export const target = "localhost:22222";
export const rootUserId = "root";
export const userId = "test";
export const cluster = "hpc01";

export async function collectInfo<T>(stream: AsyncIterable<T>) {

  const buffer = [] as T[];

  for await (const res of stream) {
    buffer.push(res);
  }

  return buffer;
}

export interface TestSshServer {
  ssh: NodeSSH;
  sftp: SFTPWrapper;
}

export const connectToTestServer = async () => {

  const ssh = await sshRawConnect(target, userId, rootKeyPair, console);

  return { ssh, sftp: await ssh.requestSFTP() } as TestSshServer;
};

export const connectToTestServerAsRoot = async () => {

  const ssh = await sshRawConnect(target, rootUserId, rootKeyPair, console);

  return { ssh, sftp: await ssh.requestSFTP() } as TestSshServer;
};

// connect as root and reset the test folders of user test
export const resetTestServerAsRoot = async (server: TestSshServer) => {
  const base = join("/home/test", path.dirname(desktopTestsFolder()));
  await sshRmrf(server.ssh, base);
  server.ssh.dispose();
};

export const resetTestServer = async (server: TestSshServer) => {
  const base = baseFolder();

  await sshRmrf(server.ssh, path.dirname(base));
  server.ssh.dispose();
};

export async function createFile(sftp: SFTPWrapper, filePath: string) {
  await sftpWriteFile(sftp)(filePath, randomBytes(10));
}

export const baseFolder = () => `tests/testFolder${process.env.JEST_WORKER_ID}/${userId}`;

export const desktopTestsFolder = () => `desktopTests/desktopsTestFolder${process.env.JEST_WORKER_ID}/${userId}`;

export function actualPath(filename: string, basefn: () => string = baseFolder) {
  return path.join(basefn(), filename);
}

// returns base folder
export async function createTestItems({ sftp, ssh }: TestSshServer): Promise<string> {
  const base = baseFolder();
  await ssh.mkdir(path.join(base, "dir1"), undefined, sftp);
  const test1 = path.join(base, "test1");
  await createFile(sftp, test1);

  return base;
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

export async function expectGrpcThrow(promise: Promise<unknown>, expectError: (error: ServiceError) => void) {
  await promise.then(() => expect("").fail("Promise resolved"), expectError);
}

// cereate a lastSubmission file of app[vscode]
export async function createVscodeLastSubmitFile(sftp: SFTPWrapper, filePath: string) {

  const lastSubmissionInfo: SubmissionInfo = {
    userId: "test",
    cluster: "hpc01",
    appId: "vscode",
    appName: "VSCode",
    account: "a_aaaaaa",
    partition: "compute",
    qos: "high",
    nodeCount: 1,
    coreCount: 2,
    maxTime: 10,
    submitTime: "2021-12-22T16:16:02",
    customAttributes: { selectVersion: "code-server/4.9.0", sbatchOptions: "--time 10" },
  };

  const newFilePath = join(filePath, "last_submission.json");
  await sftpWriteFile(sftp)(newFilePath, JSON.stringify(lastSubmissionInfo));

}

export async function createTestLastSubmissionForVscode({ sftp, ssh }: TestSshServer): Promise<string> {
  const base = baseFolder();
  await ssh.mkdir(path.join(base, "scow/apps/vscode"), undefined, sftp);
  const appId1 = path.join(base, "scow/apps/vscode");

  await createVscodeLastSubmitFile(sftp, appId1);

  return base;
}

export const testDesktopInfo: DesktopInfo = {
  host: target,
  displayId: 1,
  desktopName: "desktop-test11",
  wm: "wm-test",
};

export const anotherHostDesktopInfo: DesktopInfo = {
  host: "anotherHost",
  displayId: 2,
  desktopName: "desktop-test11",
  wm: "wm-test",
};

export const testDesktopDirPath = join("/home/test", actualPath("/scow/desktops", desktopTestsFolder));
export const testDesktopsFilePath = join(testDesktopDirPath, "desktops.json");

export async function createDesktopsFile({ sftp, ssh }: TestSshServer) {
  await ssh.mkdir(testDesktopDirPath, undefined, sftp);
  await sftpWriteFile(sftp)(testDesktopsFilePath, JSON.stringify([testDesktopInfo, anotherHostDesktopInfo]));
}
