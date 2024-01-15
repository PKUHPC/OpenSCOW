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

import { loggedExec } from "@scow/lib-ssh";
import { NodeSSH, SSHExecCommandResponse } from "node-ssh";
import { Logger } from "ts-log";

const LOADED_IMAGE_REGEX = "Loaded image: ([\\w./-]+(?::[\\w.-]+)?)";

export const loadedImageRegex = new RegExp(LOADED_IMAGE_REGEX);

// 创建要上传到harbor的镜像地址
export function createHarborImageUrl(
  { url, project, userId, imageName, imageTag }:
  { url: string,
    project: string,
    userId: string,
    imageName: string,
    imageTag: string,
  }): string {
  return `${url}/${project}/${userId}/${imageName}:${imageTag}`;
};


export enum Container {
  DOCKER = "DOCKER",
  CONTAINER_D = "CONTAINER_D"
}

// Container === Container.DOCKER的情况
// TODO：其他容器的情况

// 加载本地镜像
export async function getLoadedImage({
  ssh,
  logger,
  sourcePath,
}: {
  ssh: NodeSSH,
  logger: Logger,
  sourcePath: string,
}): Promise<string | undefined> {

  const loadedResp = await loggedExec(ssh, logger, true, "docker", ["load", "-i", sourcePath]);
  const match = loadedResp.stdout.match(loadedImageRegex);
  return match && match.length > 1 ? match[1] : undefined;
}

// 拉取远程镜像
export async function getPulledImage({
  ssh,
  logger,
  sourcePath,
}: {
  ssh: NodeSSH,
  logger: Logger,
  sourcePath: string,
}): Promise<string | undefined> {

  const pulledResp = await loggedExec(ssh, logger, true, "docker", ["pull", sourcePath]);
  return pulledResp ? sourcePath : undefined;
}

// 上传镜像至harbor
export async function pushImageToHarbor({
  ssh,
  logger,
  localImageUrl,
  harborImageUrl,
  harborUrl,
  harborUser,
  password,
}: {
  ssh: NodeSSH,
  logger: Logger,
  localImageUrl: string,
  harborImageUrl: string,
  harborUrl: string,
  harborUser: string,
  password: string,
}): Promise<void> {

  await loggedExec(ssh, logger, true, "docker", ["tag", localImageUrl, harborImageUrl]);
  await loggedExec(ssh, logger, true, "docker", [ "login", harborUrl, "-u", harborUser, "-p", password ]);
  await loggedExec(ssh, logger, true, "docker", ["push", harborImageUrl]);

  // 删除本地镜像
  try {
    loggedExec(ssh, logger, false, "docker", ["rmi", localImageUrl]);
  } catch (e) {
    logger.error(`${localImageUrl} rmi failed`, e);
  };
}

// 检查保存镜像的容器是否存在
export async function checkContainerExists({
  ssh,
  logger,
  formateContainerId,
}: {
  ssh: NodeSSH,
  logger: Logger,
  formateContainerId: string,
}): Promise<SSHExecCommandResponse> {

  return await loggedExec(ssh, logger, true, "docker",
    ["ps", "--no-trunc", "|", "grep", formateContainerId]);
}

// 保存镜像
export async function saveImageToHarbor({
  ssh,
  logger,
  formateContainerId,
  committedImageUrl,
  localImageUrl,
  harborImageUrl,
  harborUrl,
  harborUser,
  password,
}: {
  ssh: NodeSSH,
  logger: Logger,
  formateContainerId: string,
  committedImageUrl: string,
  localImageUrl: string,
  harborImageUrl: string,
  harborUrl: string,
  harborUser: string,
  password: string,
}): Promise<void> {

  // 用新名字commit镜像
  await loggedExec(ssh, logger, true, "docker",
    ["commit", formateContainerId, committedImageUrl]);

  // docker login harbor
  await loggedExec(ssh, logger, true, "docker", ["login", harborUrl, "-u", harborUser, "-p", password]);

  // docker tag
  await loggedExec(ssh, logger, true, "docker", ["tag", localImageUrl, harborImageUrl]);

  // push 镜像至harbor
  await loggedExec(ssh, logger, true, "docker", ["push", harborImageUrl]);

  // 清除本地镜像
  await loggedExec(ssh, logger, true, "docker", ["rmi", harborImageUrl]);
  await loggedExec(ssh, logger, true, "docker", ["rmi", localImageUrl]);
}
