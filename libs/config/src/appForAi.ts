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
import { createI18nStringSchema } from "src/i18n";


export enum AppType {
  web = "web",
}

export const AppConnectPropsSchema = Type.Object({
  method: Type.Enum({ GET: "GET", POST: "POST" }, { description: "连接所使用的HTTP方法" }),
  path: Type.String({ description: "启动的相对路径" }),
  query: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "query参数" })),
  formData: Type.Optional(
    Type.Record(Type.String(), Type.String(), { description: "设置为POST时，需要以form data形式提交的数据" })),
}, { description: "如何连接应用" });

export type AppConnectPropsSchema = Static<typeof AppConnectPropsSchema>;

export const WebAppConfigSchema = Type.Object({
  proxyType:
    Type.Enum(
      { relative: "relative", absolute: "absolute" },
      { description: "proxy 类型", default: "relative" },
    ),
  connect: AppConnectPropsSchema,
});

export type WebAppConfigSchema = Static<typeof WebAppConfigSchema>;


export const AppConfigSchema = Type.Object({
  name: Type.String({ description: "App名" }),
  logoPath: Type.Optional(Type.String({ description: "App应用图标的图片源路径" })),
  image: Type.Object({
    name: Type.String({ description: "App镜像名" }),
    tag: Type.String({ description: "App镜像标签", default: "latest" }),
  }),
  type: Type.Enum(AppType, { description: "应用类型" }),
  web: Type.Optional(WebAppConfigSchema),
  appComment: Type.Optional(createI18nStringSchema({ description: "应用说明文字" })),

});

export type AppConfigSchema = Static<typeof AppConfigSchema>;

export const APP_CONFIG_BASE_PATH = "aiApps";

export const getAiAppConfigs: GetConfigFn<Record<string, AppConfigSchema>> = (baseConfigPath, logger) => {

  const aiAppsConfig = getDirConfig(
    AppConfigSchema,
    APP_CONFIG_BASE_PATH,
    baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH,
    logger,
  );

  Object.entries(aiAppsConfig).forEach(([id, config]) => {
    if (!config[config.type]) {
      throw new Error(`App ${id} is of type ${config.type} but config.${config.type} is not set`);
    }
  });

  return aiAppsConfig;
};
