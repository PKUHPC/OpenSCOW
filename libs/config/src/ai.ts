/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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


export const AiConfigSchema = Type.Object({

  db: Type.Object({
    host: Type.String({ description: "数据库地址" }),
    port: Type.Integer({ description: "数据库端口" }),
    user: Type.String({ description: "数据库用户名" }),
    password: Type.Optional(Type.String({ description: "数据库密码" })),
    dbName: Type.String({ description: "数据库数据库名" }),
    debug: Type.Boolean({ description: "打开ORM的debug模式", default: false }),
  }),
  appJobsDir: Type.String({ description: "将交互式任务的信息保存到什么位置。相对于用户的家目录", default: "scow/ai/appData" }),

  navLinks: Type.Optional(Type.Array(
    Type.Object({
      text: Type.String({ description: "一级导航名称" }),
      url: Type.Optional(Type.String({ description: "一级导航链接" })),
      openInNewPage: Type.Optional(Type.Boolean({ description:"一级导航是否默认在新页面打开", default: false })),
      iconPath: Type.Optional(Type.String({ description: "一级导航链接显示图标路径" })),
      children: Type.Optional(Type.Array(Type.Object({
        text: Type.String({ description: "二级导航名称" }),
        url: Type.String({ description: "二级导航链接" }),
        openInNewPage: Type.Optional(Type.Boolean({ description:"二级导航是否默认在新页面打开", default: false })),
        iconPath: Type.Optional(Type.String({ description: "二级导航链接显示图标路径" })),
      }))),
    }),
  )),

  harborConfig: Type.Object({
    url: Type.String({ description: "镜像存储用的Harbor仓库地址" }),
    project: Type.String({ description: "镜像存储用的Harbor仓库地址下项目名,会作为镜像存储的上级路径" }),
    user: Type.String({ description: "Harbor仓库地址登录时使用的用户名" }),
    password: Type.String({ description: "Harbor仓库地址登录时使用的登录密码" }),
    protocol: Type.String({ description: "Harbor API 的访问协议", default: "http" }),
  }),

});

const AT_CONFIG_NAME = "ai/config";

export type AiConfigSchema = Static<typeof AiConfigSchema>;

export type HarborConfig = AiConfigSchema["harborConfig"];

export const getAiConfig: GetConfigFn<AiConfigSchema> = (baseConfigPath) => {
  const config =
    getConfigFromFile(AiConfigSchema, AT_CONFIG_NAME, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);

  return config;

};
