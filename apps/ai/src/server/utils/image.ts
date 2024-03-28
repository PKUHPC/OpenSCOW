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
import { TRPCError } from "@trpc/server";
import { NodeSSH } from "node-ssh";
import { Logger } from "ts-log";

import { aiConfig } from "../config/ai";
import { clusters } from "../config/clusters";

const LOADED_IMAGE_REGEX = "Loaded image: ([\\w./-]+(?::[\\w.-]+)?)";

export const loadedImageRegex = new RegExp(LOADED_IMAGE_REGEX);

const { url: harborUrl, project, user: harborUser, password } = aiConfig.harborConfig;

// 创建要上传到harbor的镜像地址
export function createHarborImageUrl(imageName: string, imageTag: string, userId: string): string {

  return `${harborUrl}/${project}/${userId}/${imageName}:${imageTag}`;
};

export enum k8sRuntime {
  docker = "docker",
  containerd = "containerd"
}

const runtimeCommands = {
  [k8sRuntime.docker]: "docker",
  // -n namespace，k8s集群相关的容器命令必须加上该参数才有对应数据
  [k8sRuntime.containerd]: "nerdctl -n k8s.io",
};

const runtimeContainerIdPrefix = {
  [k8sRuntime.docker]: "docker",
  [k8sRuntime.containerd]: "containerd",
};

export function getK8sRuntime(clusterId: string): k8sRuntime {
  const runtime = clusters[clusterId].k8s?.runtime;
  return runtime ?? k8sRuntime.docker;
}

export function getRuntimeCommand(runtime: k8sRuntime): string {
  return runtimeCommands[runtime];
}

function getContainerIdPrefix(runtime: k8sRuntime): string {
  return runtimeContainerIdPrefix[runtime];
}

// 加载本地镜像
export async function getLoadedImage({
  ssh,
  logger,
  sourcePath,
  clusterId,
}: {
  ssh: NodeSSH,
  logger: Logger,
  sourcePath: string,
  clusterId: string,
}): Promise<string | undefined> {

  const runtime = getK8sRuntime(clusterId);
  const command = getRuntimeCommand(runtime);

  const loadedResp = await loggedExec(ssh, logger, true, command, ["load", "-i", sourcePath]);
  const match = loadedResp.stdout.match(loadedImageRegex);
  return match && match.length > 1 ? match[1] : undefined;
}

// 拉取远程镜像
export async function getPulledImage({
  ssh,
  logger,
  sourcePath,
  clusterId,
}: {
  ssh: NodeSSH,
  logger: Logger,
  sourcePath: string,
  clusterId: string,
}): Promise<string | undefined> {

  const runtime = getK8sRuntime(clusterId);
  const command = getRuntimeCommand(runtime);

  const pulledResp = await loggedExec(ssh, logger, true, command, ["pull", sourcePath]);

  return pulledResp ? sourcePath : undefined;
}

// 上传镜像至harbor
export async function pushImageToHarbor({
  ssh,
  logger,
  localImageUrl,
  harborImageUrl,
  clusterId,
}: {
  ssh: NodeSSH,
  logger: Logger,
  localImageUrl: string,
  harborImageUrl: string,
  clusterId: string,
}): Promise<void> {

  const runtime = getK8sRuntime(clusterId);
  const command = getRuntimeCommand(runtime);

  // login harbor
  await loggedExec(ssh, logger, true, command, ["login", harborUrl, "-u", harborUser, "-p", password]);

  // tag
  await loggedExec(ssh, logger, true, command, ["tag", localImageUrl, harborImageUrl]);

  // push 镜像至harbor
  // 运行时为 containerd 时，需添加 --all-platforms 确保多平台镜像可以正确推送
  await loggedExec(ssh, logger, true, command,
    runtime === k8sRuntime.containerd ?
      ["push", "--all-platforms", harborImageUrl] : ["push", harborImageUrl]);

  // 清除本地镜像
  await loggedExec(ssh, logger, true, command, ["rmi", harborImageUrl]);
  await loggedExec(ssh, logger, true, command, ["rmi", localImageUrl]);
}

// commit制作本地镜像
export async function commitContainerImage({
  node,
  ssh,
  logger,
  formateContainerId,
  localImageUrl,
  clusterId,
}: {
  node: string,
  ssh: NodeSSH,
  logger: Logger,
  formateContainerId: string,
  localImageUrl: string,
  clusterId: string,
}): Promise<void> {

  const runtime = getK8sRuntime(clusterId);
  const command = getRuntimeCommand(runtime);
  const resp = await loggedExec(ssh, logger, true, "sh",
    ["-c", `${command} ps --no-trunc | grep ${formateContainerId}`]);
  if (!resp.stdout) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Can not find the container: ${formateContainerId} in node ${node}`,
    });
  }

  // commit镜像
  await loggedExec(ssh, logger, true, command,
    ["commit", formateContainerId, localImageUrl]);
}


export const formatContainerId = (clusterId: string, containerId: string) => {
  const runtime = getK8sRuntime(clusterId);
  const prefix = getContainerIdPrefix(runtime);
  return containerId.replace(`${prefix}://`, "");
};
