import { SFTPWrapper } from "ssh2";
import { promisify } from "util";

export const sftpExists = (sftp: SFTPWrapper, path: string) =>
  new Promise<boolean>((res) => {
    sftp.stat(path, (err) => res(err === undefined));
  });

export const sftpWriteFile = (sftp: SFTPWrapper) => promisify(sftp.writeFile.bind(sftp));

export const sftpReadFile = (sftp: SFTPWrapper) => promisify(sftp.readFile.bind(sftp));

export const sftpReaddir = (sftp: SFTPWrapper) => promisify(sftp.readdir.bind(sftp));

export const sftpChmod = (sftp: SFTPWrapper) => promisify(sftp.chmod.bind(sftp));

export const sftpRealPath = (sftp: SFTPWrapper) => promisify(sftp.realpath.bind(sftp));
