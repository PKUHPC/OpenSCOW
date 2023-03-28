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

import { getConfig } from "@scow/lib-config/build/fileConfig";
import { Static, Type } from "@sinclair/typebox";
import { join } from "path";

export const InstallationConfigSchema = Type.Object({
  port: Type.Integer({ description: "端口号", default: 80 }),
  basePath: Type.String({ description: "整个系统的部署路径", default: "/" }),
  image: Type.String({ description: "镜像", default: "ghcr.io/pkuhpc/scow/scow" }),
  imageTag: Type.String({ description: "镜像tag", default: "master" }),

  log: Type.Object({
    level: Type.String({ description: "日志级别", default: "info" }),
    pretty: Type.Boolean({ description: "日志格式", default: false }),
    fluentd: Type.Optional(Type.Object({
      image: Type.Optional(Type.String({ description: "fluentd镜像", default: "fluentd:v1.14.0-1.0" })),
      logDir: Type.String({ description: "日志目录", default: "/var/log/fluentd" }),
    })),
  }, { default: {} }),

  portal: Type.Optional(Type.Object({
    basePath: Type.String({ description: "门户系统的部署路径，相对于整个系统的basePath", default: "/" }),
    novncClientImage: Type.String({ description: "novnc客户端镜像", default: "ghcr.io/pkuhpc/novnc-client-docker:master" }),
  }, { description: "门户系统部署选项，如果不设置，则不部署门户系统" })),

  mis: Type.Optional(Type.Object({
    mysqlImage: Type.String({ description: "管理系统数据库镜像", default: "mysql:8" }),
    basePath: Type.String({ description: "管理系统的部署路径，相对于整个系统的", default: "/" }),
    dbPassword: Type.String({ description: "管理系统数据库密码", default: "must!chang3this" }),
  })),

  auth: Type.Object({
    redisImage: Type.String({ description: "认证系统redis镜像", default: "redis:alpine" }),
    image: Type.String({ description: "认证系统镜像", default: "ghcr.io/pkuhpc/scow/auth:master" }),
    ports: Type.Optional(Type.Record(Type.String(), Type.Integer(), { description: "端口映射" })),
    env: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "环境变量" })),
    volumes: Type.Optional(Type.Record(Type.String(), Type.String(), {
      description: "更多挂载卷。默认添加/etc/hosts:/etc/hosts和./config:/etc/scow",
    })),
  }, { default: {} }),

  debug: Type.Object({
    openPorts: Type.Optional(Type.Object({
      db: Type.Optional(Type.Integer({ description: "数据库端口" })),
      redis: Type.Optional(Type.Integer({ description: "redis端口" })),
      misServer: Type.Optional(Type.Integer({ description: "管理系统服务端口" })),
      portalServer: Type.Optional(Type.Integer({ description: "门户系统服务端口" })),
      auth: Type.Optional(Type.Integer({ description: "认证系统端口。对自定义认证系统无效" })),
    }, { description: "开放的端口" })),
  }, { default: {}, description: "调试选项" }),

  extra: Type.Optional(Type.Object({
    composeServices: Type.Record(
      Type.String(),
      Type.Object({}, { additionalProperties: true }),
      { description: "额外的docker-compose服务" },
    ),
    composeVolumes: Type.Record(
      Type.String(),
      Type.Object({}, { additionalProperties: true }),
      { description: "额外的docker-compose卷" },
    ),
  })),

});

export type InstallationConfigSchema = Static<typeof InstallationConfigSchema>;

export function getInstallationConfig(filePath: string) {

  return getConfig(InstallationConfigSchema, join(process.cwd(), filePath));
}
