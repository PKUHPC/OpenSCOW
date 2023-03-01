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

import {
  sftpChmod, sftpChown, SftpError, sftpMkdir, sftpReaddir, sftpReadFile,
  sftpRealPath, sftpRename, sftpRmdir, sftpStat, sftpUnlink, sftpWriteFile,
} from "../src/sftp";
import {
  connectToTestServerAsRoot,
  resetTestServerAsRoot, TestSshServer,
} from "./utils";

let testServer: TestSshServer;

beforeEach(async () => {
  testServer = await connectToTestServerAsRoot();
});

afterEach(async () => {
  await resetTestServerAsRoot(testServer);
});


interface SftpTestCase {
  name: string;
  func: (sftp: SFTPWrapper) => (...args: any[]) => Promise<unknown>;
  args: (string | number | Buffer)[];
  toString: () => string;
}
const sftpErrorCases: SftpTestCase[] = [
  { name: "sftpWriteFile", func: sftpWriteFile, args: ["/data/home/newfile", Buffer.alloc(0)]},
  { name: "sftpReadFile", func: sftpReadFile, args: ["/data/home/demo_admin"]},
  { name: "sftpReaddir", func: sftpReaddir, args: ["/data/home/test"]},
  { name: "sftpChmod", func: sftpChmod, args: ["/data/home/test", "555"]},
  { name: "sftpChown", func: sftpChown, args: ["/data/home/test", 512, 555]},
  { name: "sftpRealPath", func: sftpRealPath, args: ["/data/home/test"]},
  { name: "sftpStat", func: sftpStat, args: ["/data/home"]},
  { name: "sftpUnlink", func: sftpUnlink, args: ["/data/home/test"]},
  { name: "sftpRmdir", func: sftpRmdir, args: ["/data/home/test"]},
  { name: "sftpRename", func: sftpRename, args: ["/data/home/test", "/data/home/testNew"]},
  { name: "sftpMkdir", func: sftpMkdir, args: ["/data/home/test"]},
];

sftpErrorCases.forEach((item) => {
  item.toString = () => { return item.name; };
});

it.each(sftpErrorCases)("%s should catch error and throw SftpError ", async ({ name, func, args }) => {
  try {
    await func(testServer.sftp)(...args);
    fail("should not reach here");
  } catch (e) {
    expect(e).toBeInstanceOf(SftpError);
  }
});
