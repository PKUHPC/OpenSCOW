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

import { sftpExists } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { NodeSSH } from "node-ssh";
import { join } from "path";

import { ErrorCode } from "./errorCode";
import { logger } from "./logger";
import { sshConnect } from "./ssh";

interface CheckFilePermissionPros {
  host: string;
  userIdentityId: string;
  toPath: string;
  fileName: string;
}

export async function checkCopyFile({ host, userIdentityId, toPath, fileName }: CheckFilePermissionPros) {
  await sshConnect(host, userIdentityId, logger, async (ssh) => {
    const sftp = await ssh.requestSFTP();

    const toPathExists = await sftpExists(sftp, toPath);

    // 判断目标文件夹是否存在
    if (!toPathExists) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `${toPath} is not found`,
        cause: ErrorCode.FILE_NOT_EXSIT,
      });
    }

    const fileNameExists = await sftpExists(sftp, join(toPath, fileName));

    // 判断目标文件夹下是否已存在同名文件
    if (fileNameExists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `File ${join(toPath, fileName)} already exists.`,
        cause: ErrorCode.FILE_EXSIT,
      });
    }

    // 判断文件是否有读写权限
    const checkReadableResult = await ssh.execCommand(`ls ${toPath}`);

    if (checkReadableResult.stderr) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${toPath} is not readable`,
        cause: ErrorCode.FILE_NOT_READABLE,
      });
    }

    // 尝试写入文件
    const checkWritableResult = await ssh.execCommand(`touch ${join(toPath, "test_wirte_permission_file")}`);

    if (checkWritableResult.stderr) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${toPath} is not writable`,
        cause: ErrorCode.FILE_NOT_WRITABLE,
      });
    } else {
      // 删除创建的测试文件
      await ssh.execCommand(`rm ${join(toPath, "test_wirte_permission_file")}`).catch(() => {
        logger.info("Failed to delete %s write permission test file.", toPath);
      });
    }
  });
}
