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

import { loggedExec, sftpExists,
  sftpStat, sshConnect as libConnect, sshRmrf } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { NodeSSH } from "node-ssh";
import path, { dirname, join } from "path";
import { Logger } from "ts-log";

import { rootKeyPair } from "../config/env";
import { clusterNotFound } from "./errors";
import { logger } from "./logger";
import { getClusterLoginNode } from "./ssh";

export const SHARED_DIR = "/.shared";

// 分享文件的公共路径前缀
export enum SHARED_TARGET {
  DATASET = "/dataset",
  ALGORITHM = "/algorithm",
  MODEL = "/model",
};

// 检查当前用户否具有分享权限
export async function checkSharePermission({
  ssh,
  logger,
  sourcePath,
  userId,
}: {
  ssh: NodeSSH,
  logger: Logger,
  sourcePath: string,
  userId: string,
}): Promise<void> {

  const sftp = await ssh.requestSFTP();

  const sourceFileExists = await sftpExists(sftp, sourcePath);
  // 分享时判断源文件是否存在
  if (!sourceFileExists) {
    throw new TRPCError({ code: "NOT_FOUND", message: `${sourcePath} is not found` });
  }

  // 判断是否具有拥有者访问权限
  await sftpStat(sftp)(sourcePath).catch((e) => {
    logger.error(e, "stat %s as %s failed", sourcePath, userId);
    throw new TRPCError({ code: "FORBIDDEN", message: `${sourcePath} is not accessible` });
  });

}

type shareOkCallback = (fullPath: string) => void;
type callback = () => void;

/**
 * create new File or Dir for share
 * @param clusterId 分享目录所在集群
 * @param sourceFilePath 分享源绝对路径
 * @param userId 当前操作用户Id
 * @param sharedTarget 分享的类别目录：/dataset, /algorithm, /model
 * @param targetName 分享的目标名称：数据集，算法，模型的名称
 * @param targetSubName 分享的目标子级名称：数据集版本，算法版本，模型版本的名称
 * @param homeTopDir 用户家目录/home/{userId}的上级目录
 */
export async function shareFileOrDir(
  {
    clusterId,
    sourceFilePath,
    userId,
    sharedTarget,
    targetName,
    targetSubName,
    homeTopDir,
    // fileType: FileType,
  }: {
    clusterId: string,
    sourceFilePath: string,
    userId: string,
    sharedTarget: SHARED_TARGET,
    targetName: string,
    targetSubName: string,
    homeTopDir: string,
    // fileType: FileType,
  }, successCallback?: shareOkCallback, failureCallback?: callback): Promise<void> {
  const host = getClusterLoginNode(clusterId);
  if (!host) { throw clusterNotFound(clusterId); }

  try {

    await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();
      // 获取类别路径 如 nfs/home/.shared/{userId}/{target}
      const targetDirectory = path.join(homeTopDir, SHARED_DIR, userId, sharedTarget);
      // nfs/home/.shared/{userId}/{target}/{targetName}
      const targetTopDir = path.join(targetDirectory, targetName);
      // nfs/home/.shared/{userId}/{target}/{targetName}/{versionName}
      const targetFullDir = path.join(targetDirectory, targetName, targetSubName);

      // 判断共享目录是否存在
      if (!await sftpExists(sftp, targetDirectory)) {
        await loggedExec(ssh, logger, false, "mkdir", ["-p", targetDirectory]);
        await loggedExec(ssh, logger, false, "chmod", ["-R", "555", SHARED_DIR]);
      }

      // 判断目标路径是否存在，如果不存在则创建
      const dirExists = await sftpExists(sftp, targetFullDir);
      if (!dirExists) {
        await loggedExec(ssh, logger, false, "mkdir", ["-p", targetFullDir]);
      }

      // 复制并从顶层目录递归修改文件夹权限
      const cpAndChmodCmd = `nohup cp -r --preserve=links ${sourceFilePath} ${targetFullDir} &&
      chmod -R 555 ${targetTopDir}`;
      await ssh.execCommand(cpAndChmodCmd).catch((e) => {
        failureCallback?.();
        logger.info("Failed to share %s to %s with error %s", sourceFilePath, targetFullDir, e);
      });

      successCallback?.(targetFullDir);

    });
  } catch (err) {
    logger.info("share file failed", err);
    failureCallback?.();
  }

}

/**
 * 取消分享时删除相应的文件夹
 * @param host 分享目录所在登录节点Host
 * @param sharedPath 需要取消分享的已分享主表绝对路径或子表绝对路径
 */
export async function unShareFileOrDir({
  host,
  sharedPath,
}: {
  host: string,
  sharedPath: string,
}, successCallback?: callback, failureCallback?: callback): Promise<void> {

  // 以root权限删除分享文件夹
  await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    const sftp = await ssh.requestSFTP();
    await sftpExists(sftp, sharedPath);
    await sshRmrf(ssh, sharedPath);
    successCallback?.();
  }).catch((err) => {
    logger.info("unShare file failed", err);
    failureCallback?.();
  });

}

/**
 *
 * @param clusterId 分享目录所在集群
 * @param newName 变更后的名称
 * @param oldPath 需要变更的原主表绝对路径或者原子表绝对路径
 *
 */
export async function getUpdatedSharedPath({
  clusterId,
  newName,
  oldPath,
}: {
  clusterId: string,
  newName: string,
  oldPath: string,
}): Promise<string> {

  const host = getClusterLoginNode(clusterId);
  if (!host) { throw clusterNotFound(clusterId); }

  // 以root权限更新目标文件夹名称
  const updatedPath = await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {

    const sftp = await ssh.requestSFTP();

    // 判断共享目录是否存在
    if (!await sftpExists(sftp, oldPath)) {
      throw new TRPCError({ code: "NOT_FOUND", message: `${oldPath} is not found` });
    }

    const dir = dirname(oldPath);
    const newPath = join(dir, newName);

    await loggedExec(ssh, logger, true, "mv", [oldPath, newPath]);

    return newPath;
  });

  return updatedPath;

};

