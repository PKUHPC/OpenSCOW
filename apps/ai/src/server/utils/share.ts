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

import { getUserHomedir, loggedExec, sftpExists,
  sftpStat, sshConnect as libConnect, sshRmrf } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import path, { dirname, join } from "path";

import { ClientUserInfo } from "../auth/models";
import { rootKeyPair } from "../config/env";
import { FileType } from "../trpc/route/file";
import { clusterNotFound } from "./errors";
import { logger } from "./logger";
import { getClusterLoginNode, sshConnect } from "./ssh";

export const SHARED_DIR = "/.shared";

// 分享文件的公共路径前缀
export enum SHARED_TARGET {
  DATASET = "/dataset",
  ALGORITHM = "/algorithm",
  MODEL = "/model",
};

// 这个函数名字叫check，看起来是检查权限，但是实际上却返回了用户家目录的上级目录
// 给返回值写个注释，或者直接不要给返回值
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
}): Promise<string> {
  const host = getClusterLoginNode(clusterId);

  if (!host) { throw clusterNotFound(clusterId); }

  const subLogger = logger.child({ user, checkedSourcePath, clusterId });
  subLogger.info("Check share permission started");


  return await sshConnect(host, user!.identityId, subLogger, async (ssh) => {
    const sftp = await ssh.requestSFTP();

    const userHomeDir = await getUserHomedir(ssh, user.identityId, logger);
    // 后退到用户家目录/home/{userId}的上级
    const homeTopDir = dirname(dirname(userHomeDir));

    // 判断是否为拥有者
    await sftpStat(sftp)(checkedSourcePath).catch((e) => {
      logger.error(e, "stat %s as %s failed", checkedSourcePath, user!.identityId);
      throw new TRPCError({ code: "FORBIDDEN", message: `${checkedSourcePath} is not accessible` });
    });

    const sourceFileExists = await sftpExists(sftp, checkedSourcePath);
    // 分享时判断源文件是否存在
    if (!checkedTargetPath && !sourceFileExists) {
      throw new TRPCError({ code: "NOT_FOUND", message: `${checkedSourcePath} is not found` });
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

    return homeTopDir;
  });
}

type shareOkCallback = (fullPath: string) => void;
type callback = () => void;

/**
 * create new File or Dir for share
 * @param clusterId 分享目录所在集群
 * @param sourceFilePath 分享源绝对路径
 * @param user 操作用户
 * @param sharedTarget 分享的类别目录：数据集，算法，模型
 * @param targetName 分享的目标名称：数据集，算法，模型的名称
 * @param targetSubName 分享的目标子级名称：数据集版本，算法版本，模型版本的名称
 * @param homeTopDir 用户家目录/home/{userId}的上级目录
 */
export async function shareFileOrDir(
  {
    clusterId,
    sourceFilePath,
    user,
    sharedTarget,
    targetName,
    targetSubName,
    homeTopDir,
    // fileType: FileType,
  }: {
    clusterId: string,
    sourceFilePath: string,
    user: ClientUserInfo,
    sharedTarget: SHARED_TARGET,
    targetName: string,
    targetSubName: string,
    homeTopDir: string,
    // fileType: FileType,
  }, successCallback?: shareOkCallback, failureCallback?: callback): Promise<void> {
  const host = getClusterLoginNode(clusterId);

  if (!host) { throw clusterNotFound(clusterId); }

  const subLogger = logger.child({ user, sourceFilePath, clusterId });
  subLogger.info("Share file or directory started");

  try {

    await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();
      const targetDirectory = path.join(homeTopDir, SHARED_DIR, sharedTarget);
      const targetTopDir = path.join(targetDirectory, targetName);
      const targetFullDir = path.join(targetDirectory, targetName, targetSubName);

      // 判断共享目录是否存在
      if (!await sftpExists(sftp, targetDirectory)) {

        const mkdirCmd = `mkdir -p ${targetDirectory}`;
        const chmodCmd = `chmod -R 555 ${SHARED_DIR}`;
        await loggedExec(ssh, logger, false, mkdirCmd, []);
        await loggedExec(ssh, logger, false, chmodCmd, []);
      }

      // 判断目标路径是否存在，如果不存在则创建
      const dirExists = await sftpExists(sftp, targetFullDir);
      if (!dirExists) {
        const mkdirFullDirCmd = `mkdir -p ${targetFullDir}`;
        await loggedExec(ssh, logger, false, mkdirFullDirCmd, []);
      }

      // 复制并从顶层目录递归修改文件夹权限
      const cpAndChmodCmd = `nohup cp -r ${sourceFilePath} ${targetFullDir} && chmod -R 555 ${targetTopDir}`;
      await loggedExec(ssh, logger, false, cpAndChmodCmd, []);

      successCallback && successCallback(targetFullDir);

    });
  } catch (err) {
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

/**
 *
 * @param target 数据集、算法、模型的分享类别目录
 * @param user 操作用户
 * @param clusterId 分享目录所在集群
 * @param newName 变更后的名称
 * @param isVersionName 是否为版本名称
 * @param oldPath 如果变更名称为版本名称时，为分享目录的绝对路径；如果变更名称不是版本名称时则为版本名称的上级目录，如分享的数据集目录
 *
 */
export async function updateSharedName({
  target,
  user,
  clusterId,
  newName,
  isVersionName,
  oldPath,
  needRollback,
}: {
  target: SHARED_TARGET,
  user: ClientUserInfo,
  clusterId: string,
  newName: string,
  isVersionName: boolean,
  oldPath: string,
  needRollback?: boolean;
}): Promise<void> {

  const host = getClusterLoginNode(clusterId);

  if (!host) { throw clusterNotFound(clusterId); }

  const subLogger = logger.child({ user, path, clusterId });
  subLogger.info("Update shared file name started");

  // 获取用户家目录的上级目录
  const userHomeDir = await sshConnect(host, user.identityId, logger, async (ssh) => {
    return getUserHomedir(ssh, user.identityId, logger);
  });
  const homeTopDir = dirname(dirname(userHomeDir));

  // 以root权限更新目标文件夹名称
  await libConnect(host, "root", rootKeyPair, logger, async (ssh) => {

    const sftp = await ssh.requestSFTP();
    if (!needRollback) {
      // 判断共享目录是否存在
      if (!await sftpExists(sftp, oldPath)) {
        throw new TRPCError({ code: "NOT_FOUND", message: `${oldPath} is not found` });
      }
    }
    const targetDir = path.join(homeTopDir, SHARED_DIR, target);

    // 更新各版本列表名称时
    if (isVersionName) {
      const targetDir = dirname(oldPath);
      const newFullTargetPath = join(targetDir, newName);

      const renameTargetSubCmd = needRollback ?
        `mv ${newFullTargetPath} ${oldPath}` : `mv ${oldPath} ${newFullTargetPath}`;
      await loggedExec(ssh, logger, true, renameTargetSubCmd, []);
    // 更新各主表名称时
    } else {
      const targetPath = join(targetDir, newName);

      const renameTargetCmd = needRollback ?
        `mv ${targetPath} ${oldPath}` : `mv ${oldPath} ${targetPath}`;
      await loggedExec(ssh, logger, true, renameTargetCmd, []);
    };
  });

};

