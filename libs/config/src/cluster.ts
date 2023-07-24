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

const LoginNodeConfigSchema =
  Type.Object(
    {
      name: Type.String({ description: "登录节点展示名" }), address: Type.String({ description: "集群的登录节点地址" }),
    },
  );

export type LoginNodeConfigSchema = Static<typeof LoginNodeConfigSchema>;

export const getLoginNode =
  (loginNode: string | LoginNodeConfigSchema): LoginNodeConfigSchema => {
    return typeof loginNode === "string" ? { name: loginNode, address: loginNode } : loginNode;
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
  displayName: Type.String({ description: "集群的显示名称" }),
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

    return config;
  };
