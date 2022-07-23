import { Static, Type } from "@sinclair/typebox";

export const ClustersConfigSchema = Type.Record(
  Type.String({ description: "集群ID" }),
  Type.Object({
    displayName: Type.String({ description: "集群的显示名称" }),
    scheduler: Type.Enum({ slurm: "slurm" }, { description: "集群所使用的调度器，目前只支持slurm", default: "slurm" }),
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
  }),
);

export const ClustersConfigName = "clusters";

export type Clusters = Static<typeof ClustersConfigSchema>;
