import { Static, Type } from "@sinclair/typebox";

const ClustersSchema = Type.Record(
  Type.String({ description: "集群ID" }),
  Type.Object({
    displayName: Type.String({ description: "集群的显示名称" }),
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

export const clustersConfig = {
  name: "clusters",
  schema: ClustersSchema,
};

export type Clusters = Static<typeof ClustersSchema>;
