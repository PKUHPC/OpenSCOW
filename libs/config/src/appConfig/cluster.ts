import { Static, Type } from "@sinclair/typebox";
import { SlurmMisConfigSchema } from "src/appConfig/mis";

import { getDirConfig } from "../fileConfig";

export const ClusterConfigSchema = Type.Object({
  displayName: Type.String({ description: "集群的显示名称" }),
  scheduler: Type.Enum({ slurm: "slurm" }, { description: "集群所使用的调度器，目前只支持slurm", default: "slurm" }),
  slurm: Type.Object({
    loginNodes: Type.Array(Type.String(), {  description: "集群的登录节点地址", default: []}),
    computeNodes: Type.Array(Type.String(), { description: "集群的计算节点地址", default: []}),
    partitions: Type.Record(
      Type.String({ description: "分区名" }),
      Type.Object({
        mem: Type.Integer({ description: "内存，单位M" }),
        cores: Type.Integer({ description: "核心数" }),
        gpus: Type.Integer({ description: "GPU卡数" }),
        nodes: Type.Integer({ description: "节点数" }),
        qos: Type.Optional(Type.Array(Type.String({ description: "QOS" }))),
        comment: Type.Optional(Type.String({ description: "计费项说明" })),
      }),
    ),
    mis: Type.Optional(SlurmMisConfigSchema),
  }),
  misIgnore: Type.Boolean({ description: "在实际进行MIS操作时忽略这个集群", default: false }),
});

export type ClusterConfigSchema = Static<typeof ClusterConfigSchema>;

const CLUSTER_CONFIG_BASE_PATH = "clusters";


//将partitions内容改为列表
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
        }
      ),
      {
        description: "分区信息，分区名、内存、核心数、GPU卡数、节点数、QOS、计费项说明",
        default: []
      }
    ),
    mis: Type.Optional(SlurmMisConfigSchema),
  }),
  misIgnore: Type.Boolean({ description: "在实际进行MIS操作时忽略这个集群", default: false }),
});

export type ClusterListConfigSchema = Static<typeof ClusterListConfigSchema>;

const List2Map = (src: Record<string, ClusterListConfigSchema>): Record<string, ClusterConfigSchema> => {
  let result: Record<string, ClusterConfigSchema> = {};
  for (const key in src) {
    let dir  = key;
    let temp = src[key];
    let partitionstemp: ClusterConfigSchema["slurm"]["partitions"] = {};
    for(const partition of temp.slurm.partitions) {
      partitionstemp[partition.name] = {
        mem: partition.mem,
        cores: partition.cores,
        gpus: partition.gpus,
        nodes: partition.nodes,
        qos: partition.qos,
        comment: partition.comment,
      };
    }
    result[dir] = {
      displayName: temp.displayName,
      scheduler: temp.scheduler,
      misIgnore: temp.misIgnore,
      slurm: {
        loginNodes: temp.slurm.loginNodes,
        computeNodes: temp.slurm.computeNodes,
        partitions: partitionstemp   
      }
    }
  }
  return result;
};

export const getClusterConfigs = (baseConfigPath?: string): Record<string, ClusterConfigSchema> => {

  // const appsConfig = getDirConfig(ClusterConfigSchema, CLUSTER_CONFIG_BASE_PATH, baseConfigPath);
  let appsListConfig = getDirConfig(ClusterListConfigSchema, CLUSTER_CONFIG_BASE_PATH, baseConfigPath);
  let appsConfig  =  List2Map(appsListConfig)

  Object.entries(appsConfig).forEach(([id, config]) => {
    if (!config[config.scheduler]) {
      throw new Error(`App ${id} is of scheduler ${config.scheduler} but config.${config.scheduler} is not set`);
    }
  });

  return appsConfig;
};
