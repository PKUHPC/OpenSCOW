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

import { GetConfigFn, getDirConfig } from "@scow/lib-config";
import { Static, Type } from "@sinclair/typebox";
import { DEFAULT_CONFIG_BASE_PATH } from "src/constants";
import { SlurmMisConfigSchema } from "src/mis";

export type ClusterConfigSchema = {
  displayName: string;
  scheduler: string;
  slurm: {
    loginNodes: string[];
    computeNodes: string[];
    partitions: Record<string, {
      mem: number;
      cores: number;
      gpus: number;
      nodes: number;
      qos?: string[];
      comment?: string;
    }>;
    mis: SlurmMisConfigSchema | undefined;
  };
  misIgnore: boolean;
}

const CLUSTER_CONFIG_BASE_PATH = "clusters";


// 将partitions内容改为列表
export const ClusterListConfigSchema = Type.Object({
  displayName: Type.String({ description: "集群的显示名称" }),
  scheduler: Type.Enum({ slurm: "slurm" }, { description: "集群所使用的调度器，目前只支持slurm", default: "slurm" }),
  slurm: Type.Object({
    loginNodes: Type.Array(Type.String(), { description: "集群的登录节点地址", default: []}),
    computeNodes: Type.Array(Type.String(), { description: "集群的计算节点地址", default: []}),
    partitions: Type.Array(
      Type.Object(
        {
          name: Type.String({ description: "分区名" }),
          mem: Type.Integer({ description: "内存，单位M" }),
          cores: Type.Integer({ description: "核心数" }),
          gpus: Type.Integer({ description: "GPU卡数" }),
          nodes: Type.Integer({ description: "节点数" }),
          qos: Type.Optional(Type.Array(Type.String({ description: "QOS" }))),
          comment: Type.Optional(Type.String({ description: "计费项说明" })),
        },
      ),
      {
        description: "分区信息，分区名、内存、核心数、GPU卡数、节点数、QOS、计费项说明",
        default: [],
      },
    ),
    mis: Type.Optional(SlurmMisConfigSchema),
  }),
  misIgnore: Type.Boolean({ description: "在实际进行MIS操作时忽略这个集群", default: false }),
});

export type ClusterListConfigSchema = Static<typeof ClusterListConfigSchema>;


const convertToOldConfigSchema = (
  src: Record<string, ClusterListConfigSchema>,
): Record<string, ClusterConfigSchema> => {
  const result: Record<string, ClusterConfigSchema> = {};
  for (const key in src) {
    const name = key;
    const clusterConfig = src[key];
    const partitions: ClusterConfigSchema["slurm"]["partitions"] = {};
    for (const partition of clusterConfig.slurm.partitions) {
      partitions[partition.name] = {
        mem: partition.mem,
        cores: partition.cores,
        gpus: partition.gpus,
        nodes: partition.nodes,
        qos: partition.qos,
        comment: partition.comment,
      };
    }
    result[name] = {
      displayName: clusterConfig.displayName,
      scheduler: clusterConfig.scheduler,
      misIgnore: clusterConfig.misIgnore,
      slurm: {
        loginNodes: clusterConfig.slurm.loginNodes,
        computeNodes: clusterConfig.slurm.computeNodes,
        partitions: partitions,
        mis: clusterConfig.slurm.mis,
      },
    };
  }
  return result;
};

export const getClusterConfigs: GetConfigFn<Record<string, ClusterConfigSchema>> = (baseConfigPath) => {

  const appsListConfig = getDirConfig(ClusterListConfigSchema,
    CLUSTER_CONFIG_BASE_PATH, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);
  const appsConfig = convertToOldConfigSchema(appsListConfig);

  // check duplicate slurm cluster id
  const slurmClusters = new Set();
  Object.values(appsConfig).forEach((config) => {
    if (config.slurm && config.slurm.mis) {
      if (slurmClusters.has(config.slurm.mis.clusterName)) {
        throw new Error(`slurm cluster ${config.slurm.mis.clusterName} has already been used.`);
      } else {
        slurmClusters.add(config.slurm.mis.clusterName);
      }
    }
  });

  Object.entries(appsConfig).forEach(([id, config]) => {
    if (!config[config.scheduler]) {
      throw new Error(`App ${id} is of scheduler ${config.scheduler} but config.${config.scheduler} is not set`);
    }
  });

  return appsConfig;
};
