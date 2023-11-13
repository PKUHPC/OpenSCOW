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

interface ClusterInfo {
  // 集群名称
  cluster: string;
  // 分区名称
  partition: string;
  // 节点总数
  nodes: number;
  // 运行中的节点数
  runningNodes: number;
  // 空闲的节点数
  idleNodes: number;
  // 不可用的节点数
  noAviailableNodes: number;
  // CPU核数
  cpuCores: number;
  // 运行中的CPU数
  runningCpus: number;
  // 空闲的CPU数
  idleCpus: number;
  // 不可用的CPU数
  noAviailableCpus: number;
  // GPU核数
  gpuCores: number;
  // 运行中的GPU数
  runningGpus: number;
  // 空闲的GPU数
  idleGpus: number;
  // 不可用的GPU数
  noAviailableGpus: number;
  // 作业总数
  jobNum: number;
  // 运行中的作业数
  runningJob: number;
  // 排队中的作业数
  pendingJob: number;
  // 节点利用率
  usageRate: string;
  // 分区状态
  status: string;
}
