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
import { SlurmMisConfigSchema } from "src/mis";

const CLUSTER_CONFIG_BASE_PATH = "clusters";

const LoginNodeConfigSchema =
  Type.Object(
    {
      name: Type.String({ description: "登录节点展示名" }), address: Type.String({ description: "集群的登录节点地址" }),
    },
  );

export type LoginNodeConfigSchema = Static<typeof LoginNodeConfigSchema>;

export const ClusterConfigSchema = Type.Object({
  displayName: Type.String({ description: "集群的显示名称" }),
  scheduler: Type.Enum({ slurm: "slurm" }, { description: "集群所使用的调度器，目前只支持slurm", default: "slurm" }),
  proxyGateway: Type.Optional(Type.Object({
    url: Type.String({ description: "代理网关节点监听URL" }),
    autoSetupNginx: Type.Boolean({ description: "是否自动配置nginx", default: false }),
  })),
  slurm: Type.Object({
    loginNodes: Type.Union([
      Type.Array(LoginNodeConfigSchema),
      Type.Array(Type.String(), { description: "集群的登录节点地址", default: []}),
    ]),
    partitions: Type.Array(
      Type.Object(
        {
          name: Type.String({ description: "分区名", pattern: "^[^ ]+$" }),
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


export type ClusterConfigSchema = Static<typeof ClusterConfigSchema>;

type CompatibilityClusterConfigSchema = Omit<ClusterConfigSchema, "slurm"> & {
  slurm: Omit<ClusterConfigSchema["slurm"], "loginNodes"> & {
    loginNodes: LoginNodeConfigSchema[];
  };
};

export const getClusterConfigs: GetConfigFn<Record<string, CompatibilityClusterConfigSchema>> =
  (baseConfigPath, logger) => {
    const config = getDirConfig(
      ClusterConfigSchema,
      CLUSTER_CONFIG_BASE_PATH,
      baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH,
      logger,
    );

    Object.entries(config).forEach(([id, c]) => {
      if (!c[c.scheduler]) {
        throw new Error(`App ${id} is of scheduler ${c.scheduler} but config.${c.scheduler} is not set`);
      }
      // 兼容loginNodes配置
      c.slurm.loginNodes = c.slurm.loginNodes.map((node: string | LoginNodeConfigSchema) => {
        if (typeof node === "string") {
          return { name: node, address: node } as LoginNodeConfigSchema;
        }
        return node;
      });
    });

    return config as Record<string, CompatibilityClusterConfigSchema>;
  };
