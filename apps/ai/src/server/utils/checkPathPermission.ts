/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { loggedExec, sftpExists } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { join } from "path";

import { ErrorCode } from "./errorCode";
import { logger } from "./logger";
import { sshConnect } from "./ssh";

interface CheckFilePermission {
  host: string;
  userIdentityId: string;
  toPath: string;
}

interface CheckCopyFilePros extends CheckFilePermission {
  fileName: string;
}

interface CheckCreateResource extends CheckFilePermission {}

export async function checkCopyFilePath({ host, userIdentityId, toPath, fileName }: CheckCopyFilePros) {
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
    const checkReadableResult = await loggedExec(ssh, logger, false, "ls", [toPath]);

    if (checkReadableResult.code !== 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${toPath} is not readable, ${checkReadableResult.stderr}`,
        cause: ErrorCode.FILE_NOT_READABLE,
      });
    }

    // 尝试写入文件
    const checkWritableResult
      = await loggedExec(ssh, logger, false, "touch", [join(toPath, "test_wirte_permission_file")]);
    if (checkWritableResult.code !== 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${toPath} is not writable, ${checkWritableResult.stderr}`,
        cause: ErrorCode.FILE_NOT_WRITABLE,
      });
    } else {
      // 删除创建的测试文件
      await loggedExec(ssh, logger, false, "rm", [join(toPath, "test_wirte_permission_file")])
        .catch(() => {
          logger.info("Failed to delete %s write permission test file.", toPath);
        });
    }
  });
}

export async function checkCreateResourcePath({ host, userIdentityId, toPath }: CheckCreateResource) {
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

    // 判断文件夹是否有读写权限
    const checkReadableResult = await loggedExec(ssh, logger, false, "ls", [toPath]);

    if (checkReadableResult.code !== 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${toPath} is not readable, ${checkReadableResult.stderr}`,
        cause: ErrorCode.FILE_NOT_READABLE,
      });
    }

    // 尝试写入文件
    const checkWritableResult =
      await loggedExec(ssh, logger, false, "touch", [join(toPath, "test_wirte_permission_file")]);

    if (checkWritableResult.code !== 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${toPath} is not writable, ${checkWritableResult.stderr}`,
        cause: ErrorCode.FILE_NOT_WRITABLE,
      });
    } else {
      // 删除创建的测试文件
      await loggedExec(ssh, logger, false, "rm", [join(toPath, "test_wirte_permission_file")]).catch(() => {
        logger.info("Failed to delete %s write permission test file.", toPath);
      });
    }
  });
}
