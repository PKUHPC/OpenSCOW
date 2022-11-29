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

import { GetConfigFn, getConfigFromFile } from "@scow/lib-config";
import { Static, Type } from "@sinclair/typebox";
import { DEFAULT_CONFIG_BASE_PATH } from "src/constants";

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
  getConfigFromFile(ClusterTextsConfigSchema, CLUSTER_TEXTS_CONFIG_SCHEMA, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);
