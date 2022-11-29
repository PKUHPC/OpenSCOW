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

import { NodeSSH } from "node-ssh";
import { SFTPWrapper } from "ssh2";
import { promisify } from "util";

export const sftpExists = (sftp: SFTPWrapper, path: string) =>
  new Promise<boolean>((res) => {
    sftp.stat(path, (err) => res(err === undefined));
  });

export const sftpWriteFile = (sftp: SFTPWrapper) =>
  promisify(sftp.writeFile.bind(sftp) as typeof sftp["writeFile"]);

export const sftpReadFile = (sftp: SFTPWrapper) =>
  promisify(sftp.readFile.bind(sftp) as typeof sftp["readFile"]);

export const sftpReaddir = (sftp: SFTPWrapper) =>
  promisify(sftp.readdir.bind(sftp) as typeof sftp["readdir"]);

export const sftpChmod = (sftp: SFTPWrapper) =>
  promisify(sftp.chmod.bind(sftp) as typeof sftp["chmod"]);

export const sftpChown = (sftp: SFTPWrapper) =>
  promisify(sftp.chown.bind(sftp) as typeof sftp["chown"]);

export const sftpRealPath = (sftp: SFTPWrapper) =>
  promisify(sftp.realpath.bind(sftp) as typeof sftp["realpath"]);

export const sftpStat = (sftp: SFTPWrapper) =>
  promisify(sftp.stat.bind(sftp) as typeof sftp["stat"]);

export const sftpUnlink = (sftp: SFTPWrapper) =>
  promisify(sftp.unlink.bind(sftp) as typeof sftp["unlink"]);

export const sftpRmdir = (sftp: SFTPWrapper) =>
  promisify(sftp.rmdir.bind(sftp) as typeof sftp["rmdir"]);

export const sftpRename = (sftp: SFTPWrapper) =>
  promisify(sftp.rename.bind(sftp) as typeof sftp["rename"]);

export const sftpMkdir = (sftp: SFTPWrapper) =>
  promisify(sftp.mkdir.bind(sftp) as typeof sftp["mkdir"]);

export async function sshRmrf(ssh: NodeSSH, path: string) {
  await ssh.exec("rm", ["-rf", path]);
}

