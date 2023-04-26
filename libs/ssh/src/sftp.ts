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

import { SFTPWrapper } from "ssh2";
import { promisify } from "util";

export class SftpError extends Error {
  constructor(e: Error) {
    super("SFTP operation failed：" + e.message, { cause: e });
  }
}

export const handleSftpError = <TReturn, TParams extends any[]>(func: (...params: TParams) => Promise<TReturn>) =>
  (...params: TParams) => {
    return func(...params).catch((e) => {
      throw new SftpError(e);
    });
  };

export const sftpExists = (sftp: SFTPWrapper, path: string) =>
  new Promise<boolean>((res) => {
    sftp.stat(path, (err) => res(err === undefined));
  }).catch((e) => {
    throw new SftpError(e);
  });

export const sftpWriteFile = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.writeFile.bind(sftp) as typeof sftp["writeFile"]));

export const sftpReadFile = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.readFile.bind(sftp) as typeof sftp["readFile"]));

export const sftpReaddir = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.readdir.bind(sftp) as typeof sftp["readdir"]));

export const sftpChmod = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.chmod.bind(sftp) as typeof sftp["chmod"]));

export const sftpChown = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.chown.bind(sftp) as typeof sftp["chown"]));

export const sftpRealPath = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.realpath.bind(sftp) as typeof sftp["realpath"]));

export const sftpStat = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.stat.bind(sftp) as typeof sftp["stat"]));

export const sftpStatOrUndefined = (sftp: SFTPWrapper) => (path: string) =>
  sftpStat(sftp)(path).catch(() => undefined);

export const sftpUnlink = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.unlink.bind(sftp) as typeof sftp["unlink"]));

export const sftpRmdir = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.rmdir.bind(sftp) as typeof sftp["rmdir"]));

export const sftpRename = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.rename.bind(sftp) as typeof sftp["rename"]));

export const sftpMkdir = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.mkdir.bind(sftp) as typeof sftp["mkdir"]));

export const sftpAppendFile = (sftp: SFTPWrapper) =>
  handleSftpError(promisify(sftp.appendFile.bind(sftp) as typeof sftp["appendFile"]));

