import { GetConfigFn, getConfigFromFile } from "@scow/lib-config";
import { Static, Type } from "@sinclair/typebox";
import { defaultBasePathConfig } from "src/constants";

export const ClusterTextsConfigSchema = Type.Record(
  Type.String({ description: "租户，如果为default则是对所有租户" }),
  Type.Object({
    clusterComment:Type.Optional(Type.String({ description: "集群说明" })),
    extras: Type.Optional(Type.Array(Type.Object({
      title: Type.String({ description: "标题" }),
      content: Type.String({ description: "内容" }),
    }))) }, { description: "其他内容" },
  ),
);

const CLUSTER_TEXTS_CONFIG_SCHEMA = "clusterTexts";

export type ClusterTextsConfigSchema = Static<typeof ClusterTextsConfigSchema>;

export const getClusterTextsConfig: GetConfigFn<ClusterTextsConfigSchema> = (baseConfigPath) =>
  getConfigFromFile(ClusterTextsConfigSchema, CLUSTER_TEXTS_CONFIG_SCHEMA, baseConfigPath ?? defaultBasePathConfig);
