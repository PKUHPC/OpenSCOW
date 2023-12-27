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

import { sftpChmod, sftpExists, sftpStat, sftpUnlink, sshConnect as libConnect } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { dirname } from "path";

import { ClientUserInfo } from "../auth/models";
import { rootKeyPair } from "../config/env";
import { clusterNotFound } from "./errors";
import { logger } from "./logger";
import { getClusterLoginNode, sshConnect } from "./ssh";


/**
 * create hardLink for shareFile
 */
export async function shareFile(
  clusterId: string,
  sourceFilePath: string,
  targetPath: string,
  user: ClientUserInfo,
): Promise<void> {

  const host = getClusterLoginNode(clusterId);

  if (!host) { throw clusterNotFound(clusterId); }

  const subLogger = logger.child({ user, sourceFilePath, clusterId });
  subLogger.info("Share file started");

  try {
    await sshConnect(host, user!.identityId, subLogger, async (ssh) => {
      const sftp = await ssh.requestSFTP();
      // 判断是否为拥有者
      await sftpStat(sftp)(sourceFilePath).catch((e) => {
        logger.error(e, "stat %s as %s failed", sourceFilePath, user!.identityId);
        throw new TRPCError({ code: "FORBIDDEN", message: `${sourceFilePath} is not accessible` });
      });

      const sourceFileExists = await sftpExists(sftp, sourceFilePath);
      if (!sourceFileExists) {
        throw new TRPCError({ code: "NOT_FOUND", message: `${sourceFilePath} is not found` });
      }
    });

    await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();
      const targetDirectory = dirname(targetPath);
      // 判断目标路径是否存在，如果不存在则创建
      const dirExists = await sftpExists(sftp, targetDirectory);
      if (!dirExists) {
        await ssh.mkdir(targetDirectory);
        await sftpChmod(sftp)(targetDirectory, "555");
      }

      await ssh.execCommand(`ln ${sourceFilePath} ${targetPath}`);
      await sftpChmod(sftp)(targetPath, "555");
    });
  } catch (err) {
    // rollback
    await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();
      const linkExists = await sftpExists(sftp, targetPath);
      if (linkExists) {
        await sftpUnlink(sftp)(targetPath);
      }
    });
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "share file failed", cause: err });
  }

}

/**
 * delete hardLink for unshareFile
 */
export async function unShareFile(
  clusterId: string,
  path: string,
  privatePath: string,
  user: ClientUserInfo,
): Promise<void> {

  const host = getClusterLoginNode(clusterId);

  if (!host) { throw clusterNotFound(clusterId); }

  const subLogger = logger.child({ user, path, clusterId });
  subLogger.info("Unshare file started");


  await sshConnect(host, user!.identityId, subLogger, async (ssh) => {
    const sftp = await ssh.requestSFTP();
    // 判断是否为拥有者
    await sftpStat(sftp)(privatePath).catch((e) => {
      logger.error(e, "stat %s as %s failed", privatePath, user!.identityId);
      throw new TRPCError({ code: "FORBIDDEN", message: `${privatePath} is not accessible` });
    });

    // 判断是否可以访问已分享文件地址
    await sftpStat(sftp)(path).catch((e) => {
      logger.error(e, "stat %s as %s failed", path, user!.identityId);
      throw new TRPCError({ code: "FORBIDDEN", message: `${path} is not accessible` });
    });

    const sharedFileExists = await sftpExists(sftp, path);
    if (!sharedFileExists) {
      throw new TRPCError({ code: "NOT_FOUND", message: `${path} is not found` });
    }
  });

  // 以root权限删除
  await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    const sftp = await ssh.requestSFTP();
    await sftpUnlink(sftp)(path);
  }).catch((err) => {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "unShare file failed", cause: err });
  });

}

