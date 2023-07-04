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
import { logger } from "src/log";

export const InstallConfigSchema = Type.Object({
  port: Type.Integer({ description: "端口号", default: 80 }),
  basePath: Type.String({ description: "整个系统的部署路径", default: "/" }),
  image: Type.Optional(Type.String({ description: "镜像", default: "mirrors.pku.edu.cn/pkuhpc-icode/scow" })),
  imageTag: Type.String({ description: "镜像tag", default: "master" }),

  log: Type.Object({
    level: Type.String({ description: "日志级别", default: "info" }),
    pretty: Type.Boolean({ description: "日志格式", default: false }),
    fluentd: Type.Optional(Type.Object({
      image: Type.String({ description: "fluentd镜像", default: "fluentd:v1.14.0-1.0" }),
      logDir: Type.String({ description: "日志目录", default: "/var/log/fluentd" }),
    })),
  }, { default: {} }),

  gateway: Type.Object({
    uploadFileSizeLimit: Type.String({
      description: "限制整个系统上传（请求）文件的大小，可接受的格式为nginx的client_max_body_size可接受的值",
      default: "1G",
    }),

    proxyReadTimeout: Type.String({
      description: "限制后端服务发出响应的超时时间，可接受的格式为nginx的proxy_read_timeout可接受的值",
      default: "60s",
    }),

    extra: Type.String({
      description: "更多nginx配置，可接受的格式为nginx的server可接受的属性配置，可增加在当前系统nginx端口（默认80）的服务等",
      default: "",
    }),
  }, { default: {} }),

  portal: Type.Optional(Type.Object({
    basePath: Type.String({ description: "门户系统的部署路径，相对于整个系统的basePath", default: "/" }),
    novncClientImage: Type.String({ description: "novnc客户端镜像", default: "ghcr.io/pkuhpc/novnc-client-docker:master" }),

    portMappings: Type.Optional(Type.Object({
      portalServer: Type.Optional(Type.Union([Type.String(), Type.Integer()], {
        description: "portal-server映射出来的端口",
      })),
    })),

  }, { description: "门户系统部署选项，如果不设置，则不部署门户系统" })),

  mis: Type.Optional(Type.Object({
    mysqlImage: Type.String({ description: "管理系统数据库镜像", default: "mysql:8" }),
    basePath: Type.String({ description: "管理系统的部署路径，相对于整个系统的", default: "/mis" }),
    dbPassword: Type.String({ description: "管理系统数据库密码", default: "must!chang3this" }),

    portMappings: Type.Optional(Type.Object({
      db: Type.Optional(Type.Union([Type.String(), Type.Integer()], { description: "数据库映射出来的端口" })),
      misServer: Type.Optional(Type.Union([Type.String(), Type.Integer()], {
        description: "mis-server映射出来的端口",
      })),
    })),
  })),

  auth: Type.Object({

    redisImage: Type.String({ description: "认证系统redis镜像", default: "redis:alpine" }),

    portMappings: Type.Optional(Type.Object({
      redis: Type.Optional(Type.Union([Type.String(), Type.Integer()], { description: "redis服务映射出来的端口" })),
      auth: Type.Optional(Type.Union([Type.String(), Type.Integer()], {
        description: "自带认证系统映射出来的端口，对自定义认证系统无效",
      })),
    })),

    custom: Type.Optional(Type.Object({
      image: Type.String({ description: "认证系统镜像" }),
      ports: Type.Optional(Type.Array(Type.String(), { description: "端口映射" })),
      environment: Type.Optional(Type.Union([
        Type.Array(Type.String({ description: "格式：变量名=变量值" })),
        Type.Record(Type.String(), Type.String(), { description: "格式：字符串: 字符串" }),
      ], { description: "环境变量配置" })),
      volumes: Type.Optional(Type.Array(Type.String(), {
        description: "更多挂载卷。默认添加/etc/hosts:/etc/hosts和./config:/etc/scow",
      })),
    }, { description: "自定义认证系统配置" })),
  }, { default: {} }),

  plugins: Type.Object({
    enabledPlugins: Type.Optional(Type.Array(Type.String(), { description: "启用的插件列表" })),
    pluginsDir: Type.String({ description: "插件目录", default: "./plugins" }),
  }, { default: {} }),
});

export type InstallConfigSchema = Static<typeof InstallConfigSchema>;

export function getInstallConfig(filePath: string) {
  const fullPath = join(process.cwd(), filePath);

  logger.debug("Using install config %s", fullPath);

  return getConfig(InstallConfigSchema, fullPath);
}
