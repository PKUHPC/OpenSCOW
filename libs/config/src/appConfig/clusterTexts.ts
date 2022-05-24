import { Static, Type } from "@sinclair/typebox";

export const ClusterTextsConfigSchema = Type.Record(
  Type.String({ description: "租户，如果为default则是对所有租户" }),
  Type.Object({
    clusterComment:Type.Optional(Type.String({ description: "集群说明" })),
    extras: Type.Optional(Type.Array(Type.Object({
      title: Type.String({ description: "标题" }),
      content: Type.String({ description: "内容" }),
    }))) },{ description: "其他内容" },
  ),
);

export const ClusterTextsConfigName = "clusterTexts";

export type ClusterTexts = Static<typeof ClusterTextsConfigSchema>;
