import { Static, Type } from "@sinclair/typebox";
import { SlurmMisConfigSchema } from "src/appConfig/mis";

import { getDirConfig } from "../fileConfig";

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
    loginNodes: Type.Array(Type.String(), {  description: "集群的登录节点地址", default: []}),
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


// eslint-disable-next-line max-len
const convertToOldConfigSchema = (src: Record<string, ClusterListConfigSchema>): Record<string, ClusterConfigSchema> => {
  const result: Record<string, ClusterConfigSchema> = {};
  for (const key in src) {
    const name  = key;
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

export const getClusterConfigs = (baseConfigPath?: string): Record<string, ClusterConfigSchema> => {

  // const appsConfig = getDirConfig(ClusterConfigSchema, CLUSTER_CONFIG_BASE_PATH, baseConfigPath);
  const appsListConfig = getDirConfig(ClusterListConfigSchema, CLUSTER_CONFIG_BASE_PATH, baseConfigPath);
  const appsConfig = convertToOldConfigSchema(appsListConfig);
  Object.entries(appsConfig).forEach(([id, config]) => {
    if (!config[config.scheduler]) {
      throw new Error(`App ${id} is of scheduler ${config.scheduler} but config.${config.scheduler} is not set`);
    }
  });

  return appsConfig;
};
