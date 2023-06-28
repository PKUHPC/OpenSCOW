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

const CLUSTER_CONFIG_BASE_PATH = "clusters";

export const ClusterConfigSchema = Type.Object({
  displayName: Type.String({ description: "集群的显示名称" }),
  adapterUrl: Type.String({ description: "调度器适配器服务地址" }),
  proxyGateway: Type.Optional(Type.Object({
    url: Type.String({ description: "代理网关节点监听URL" }),
    autoSetupNginx: Type.Boolean({ description: "是否自动配置nginx", default: false }),
  })),
  loginNodes: Type.Array(Type.String(), { description: "集群的登录节点地址", default: []}),
});

export type ClusterConfigSchema = Static<typeof ClusterConfigSchema>;


export const getClusterConfigs: GetConfigFn<Record<string, ClusterConfigSchema>> = (baseConfigPath, logger) => {

  const config = getDirConfig(
    ClusterConfigSchema,
    CLUSTER_CONFIG_BASE_PATH,
    baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH,
    logger,
  );

  return config;
};
