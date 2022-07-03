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
