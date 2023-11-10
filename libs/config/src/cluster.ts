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
import { createI18nStringSchema } from "src/type";

const CLUSTER_CONFIG_BASE_PATH = "clusters";

const LoginNodeConfigSchema =
  Type.Object(
    {
      name: createI18nStringSchema({ description: "登录节点展示名" }), address: Type.String({ description: "集群的登录节点地址" }),
    },
  );

export type LoginNodeConfigSchema = Static<typeof LoginNodeConfigSchema>;

export const getLoginNode =
  (loginNode: string | LoginNodeConfigSchema): LoginNodeConfigSchema => {
    return typeof loginNode === "string" ? { name: loginNode, address: loginNode } : loginNode;
  };

export type Cluster = {
  id: string
} & ClusterConfigSchema

export const getSortedClusters = (clusters: Record<string, ClusterConfigSchema>): Cluster[] => {
  return Object.keys(clusters)
    .sort(
      (a, b) => {
        const aName = JSON.stringify(clusters[a].displayName);
        const bName = JSON.stringify(clusters[b].displayName);
        if (clusters[a].priority === clusters[b].priority) {
          return (
            aName > bName
              ? 1
              : aName === bName
                ? 0
                : -1
          );
        }
        return clusters[a].priority - clusters[b].priority;
      },
    ).map((id) => ({ id, ...clusters[id] }));
};

export const getSortedClusterIds = (clusters: Record<string, ClusterConfigSchema>): string[] => {
  return Object.keys(clusters)
    .sort(
      (a, b) => {
        return clusters[a].priority - clusters[b].priority;
      },
    );
};

export const LoginDeskopConfigSchema = Type.Object({
  enabled: Type.Boolean({ description: "是否启动登录节点上的桌面功能" }),
  wms: Type.Array(
    Type.Object({ name: Type.String({ description: "名称" }), wm: Type.String({ description: "wm值" }) })),
  maxDesktops: Type.Integer({ description: "每个登录节点上最多创建多少个桌面" }),
  desktopsDir: Type.String({ description: "将创建的登录节点桌面信息的保存到什么位置。相对于用户的家目录" }),
});

const TurboVncConfigSchema = Type.String({ description: "TurboVNC的安装路径" });

export type LoginDeskopConfigSchema = Static<typeof LoginDeskopConfigSchema>;
type TurboVncConfigSchema = Static<typeof TurboVncConfigSchema>;

export const ClusterConfigSchema = Type.Object({
  displayName: createI18nStringSchema({ description: "集群的显示名称" }),
  priority: Type.Number({ description: "集群使用的优先级, 数字越小越先展示", default: Number.MAX_SAFE_INTEGER }),
  adapterUrl: Type.String({ description: "调度器适配器服务地址" }),
  proxyGateway: Type.Optional(Type.Object({
    url: Type.String({ description: "代理网关节点监听URL" }),
    autoSetupNginx: Type.Boolean({ description: "是否自动配置nginx", default: false }),
  })),
  loginNodes: Type.Union([
    Type.Array(LoginNodeConfigSchema),
    Type.Array(Type.String(), { description: "集群的登录节点地址", default: []}),
  ]),
  loginDesktop: Type.Optional(LoginDeskopConfigSchema),
  turboVNCPath: Type.Optional(TurboVncConfigSchema),
  crossClusterFileTransfer: Type.Optional(Type.Object({
    enabled: Type.Boolean({ description: "是否开启跨集群传输功能", default: false }),
    transferNode: Type.Optional(Type.String({ description: "跨集群传输文件的节点" })),
  })),
});


export type ClusterConfigSchema = Static<typeof ClusterConfigSchema>;

export const getClusterConfigs: GetConfigFn<Record<string, ClusterConfigSchema>> =
  (baseConfigPath, logger) => {

    const config = getDirConfig(
      ClusterConfigSchema,
      CLUSTER_CONFIG_BASE_PATH,
      baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH,
      logger,
    );

    // 检查所有集群配置下的登陆节点地址是否重复，如果重复扔出错误
    const uniqueAddressesList = new Set();
    const allAddressesList: string[] = [];
    for (const cluster in config) {
      if (Object.hasOwnProperty.call(config, cluster)) {
        const clusterInfo = config[cluster];
        if (clusterInfo && clusterInfo.loginNodes.length > 0) {

          clusterInfo.loginNodes.map((ln) => {
            if (typeof ln === "string") {
              uniqueAddressesList.add(ln);
              allAddressesList.push(ln);
            } else {
              uniqueAddressesList.add(ln.address);
              allAddressesList.push(ln.address);
            }
          });
        }
      }
    }
    const isUnique = uniqueAddressesList.size === allAddressesList.length;
    if (!isUnique) {
      throw new Error("login node address must be unique across all clusters and all login nodes.");
    }

    return config;
  };
