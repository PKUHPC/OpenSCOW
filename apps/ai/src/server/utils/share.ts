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

import { sftpExists, sftpStat, sshConnect as libConnect, sshRmrf } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import path from "path";

import { ClientUserInfo } from "../auth/models";
import { rootKeyPair } from "../config/env";
import { FileType } from "../trpc/route/file";
import { clusterNotFound } from "./errors";
import { logger } from "./logger";
import { getClusterLoginNode, sshConnect } from "./ssh";



export const SHARED_DIR = "/data/.shared";

// 分享文件的公共路径前缀
export enum SHARED_TARGET {
  DATASET = "/dataset",
  ALGORITHM = "/algorithm",
  MODAL = "/modal",
};

export async function checkSharePermission({
  clusterId,
  checkedSourcePath,
  user,
  checkedTargetPath,
}: {
  clusterId: string,
  checkedSourcePath: string,
  user: ClientUserInfo,
  checkedTargetPath?: string,
}): Promise<void> {
  const host = getClusterLoginNode(clusterId);

  if (!host) { throw clusterNotFound(clusterId); }

  const subLogger = logger.child({ user, checkedSourcePath, clusterId });
  subLogger.info("Check share permission started");

  await sshConnect(host, user!.identityId, subLogger, async (ssh) => {
    const sftp = await ssh.requestSFTP();
    // 判断是否为拥有者
    await sftpStat(sftp)(checkedSourcePath).catch((e) => {
      logger.error(e, "stat %s as %s failed", checkedSourcePath, user!.identityId);
      throw new TRPCError({ code: "FORBIDDEN", message: `${checkedSourcePath} is not accessible` });
    });

    // 分享时判断源文件是否存在
    if (!checkedTargetPath) {
      const sourceFileExists = await sftpExists(sftp, checkedSourcePath);
      if (!sourceFileExists) {
        throw new TRPCError({ code: "NOT_FOUND", message: `${checkedSourcePath} is not found` });
      }
    }

    // 取消分享时判断已分享文件是否存在
    if (checkedTargetPath) {
      await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();
        const targetFileExists = await sftpExists(sftp, checkedTargetPath);
        if (!targetFileExists) {
          throw new TRPCError({ code: "NOT_FOUND", message: `${checkedTargetPath} is not found` });
        }
      });
    }

  });
}

type callback = () => void;
/**
 * create new File or Dir for share
 */
export async function shareFileOrDir(
  {
    clusterId,
    sourceFilePath,
    user,
    sharedTarget,
    targetName,
    targetSubName,
    // fileType: FileType,
  }: {
    clusterId: string,
    sourceFilePath: string,
    user: ClientUserInfo,
    sharedTarget: SHARED_TARGET,
    targetName: string,
    targetSubName: string,
    // fileType: FileType,
  }, successCallback?: callback, failureCallback?: callback): Promise<void> {
  const host = getClusterLoginNode(clusterId);

  if (!host) { throw clusterNotFound(clusterId); }

  const subLogger = logger.child({ user, sourceFilePath, clusterId });
  subLogger.info("Share file or directory started");

  const targetDirectory = path.join(SHARED_DIR, sharedTarget);
  const targetTopDir = path.join(targetDirectory, targetName);
  const targetFullDir = path.join(targetDirectory, targetName, targetSubName);

  try {

    await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();

      // 判断共享目录是否存在
      if (!await sftpExists(sftp, targetDirectory)) {
        await ssh.exec("mkdir", ["-p", targetDirectory], { stream: "both" });
        await ssh.exec("chmod", ["-R", "555", SHARED_DIR], { stream: "both" });
      }

      // 判断目标路径是否存在，如果不存在则创建
      const dirExists = await sftpExists(sftp, targetFullDir);
      if (!dirExists) {
        await ssh.exec("mkdir", ["-p", targetFullDir], { stream: "both" });
      }

      // 复制并从顶层目录递归修改文件夹权限
      const result =
        await ssh.execCommand(`nohup cp -r ${sourceFilePath} ${targetFullDir} && chmod -R 555 ${targetTopDir}`);
      console.log("【ssh.execCommand】", result);
      successCallback && successCallback();
    });
  } catch (err) {
    // rollback
    await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();
      const pathExists = await sftpExists(sftp, targetFullDir);
      if (pathExists) {
        await sshRmrf(ssh, targetTopDir);
      }
    });

    logger.info("share file failed", err);
    failureCallback && failureCallback();
  }

}

/**
 * delete hardLink for unshareFile
 */
export async function unShareFileOrDir({
  clusterId,
  sharedPath,
  user,
}: {
  clusterId: string,
  sharedPath: string,
  user: ClientUserInfo,
}, successCallback?: callback, failureCallback?: callback): Promise<void> {

  const host = getClusterLoginNode(clusterId);

  if (!host) { throw clusterNotFound(clusterId); }

  const subLogger = logger.child({ user, path, clusterId });
  subLogger.info("Unshare file started");

  // 以root权限删除
  await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    await sshRmrf(ssh, sharedPath);
    successCallback && successCallback();
  }).catch((err) => {
    logger.info("unShare file failed", err);
    failureCallback && failureCallback();
  });

}
