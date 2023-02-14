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

export const AppConnectPropsSchema = Type.Object({
  method: Type.Enum({ GET: "GET", POST: "POST" }, { description: "连接所使用的HTTP方法" }),
  path: Type.String({ description: "启动的相对路径" }),
  query: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "query参数" })),
  formData: Type.Optional(
    Type.Record(Type.String(), Type.String(), { description: "设置为POST时，需要以form data形式提交的数据" })),
}, { description: "如何连接应用" });

export type AppConnectPropsSchema = Static<typeof AppConnectPropsSchema>;

export enum AppType {
  web = "web",
  vnc = "vnc"
}

export const WebAppConfigSchema = Type.Object({
  proxyType:
    Type.Enum(
      { relative: "relative", absolute: "absolute" },
      { description: "proxy 类型", default: "relative" },
    ),
  beforeScript: Type.String({ description: "启动应用之前的准备命令。具体参考文档" }),
  script: Type.String({ description: "启动应用的命令。可以使用beforeScript中定义的变量" }),
  connect: AppConnectPropsSchema,
});

export type WebAppConfigSchema = Static<typeof WebAppConfigSchema>;

export const VncAppConfigSchema = Type.Object({
  beforeScript: Type.Optional(Type.String({ description: "启动应用之前的准备命令。具体参考文档" })),

  xstartup: Type.String({ description: "启动此app的xstartup脚本" }),
});

export type VncAppConfigSchema = Static<typeof VncAppConfigSchema>;

export const SlurmConfigSchema = Type.Object({
  options: Type.Array(
    Type.String({ description: "sbatch选项" }),
    { description:"运行slurm脚本时可添加的选项" },
  ),
});

export type SlurmConfigSchema = Static<typeof SlurmConfigSchema>;

export const AppConfigSchema = Type.Object({
  name: Type.String({ description: "App名" }),
  type: Type.Enum(AppType, { description: "应用类型" }),
  slurm: Type.Optional(SlurmConfigSchema),
  web: Type.Optional(WebAppConfigSchema),
  vnc: Type.Optional(VncAppConfigSchema),
  attributes: Type.Optional(Type.Array(
    Type.Object({
      type:  Type.Enum({ number: "number", text: "text", select: "select" }, { description: "表单类型" }),
      label: Type.String({ description: "表单标签" }),
      name: Type.String({ description: "表单字段名" }),
      required: Type.Boolean({ description: "是必填项", default: true }),
      defaultValue: Type.Optional(Type.Union([Type.String(), Type.Number()])),
      placeholder: Type.Optional(Type.String({ description: "输入提示信息" })),
      select: Type.Optional(
        Type.Array(
          Type.Object({
            value: Type.String({ description: "表单选项key，编程中使用" }),
            label: Type.String({ description: "表单选项展示给用户的文本" }),
          }), { description:"表单选项" },
        )),
    }),
  )),
});

export type AppConfigSchema = Static<typeof AppConfigSchema>;

export const APP_CONFIG_BASE_PATH = "apps";

export const getAppConfigs: GetConfigFn<Record<string, AppConfigSchema>> = (baseConfigPath) => {

  const appsConfig = getDirConfig(AppConfigSchema, APP_CONFIG_BASE_PATH, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);

  Object.entries(appsConfig).forEach(([id, config]) => {
    if (!config[config.type]) {
      throw new Error(`App ${id} is of type ${config.type} but config.${config.type} is not set`);
    }
    if (config.attributes) {
      config.attributes.forEach((item) => {
        if (item.type === "select" && !item.select) {
          throw new Error(`
          App ${id}'s form attributes of name ${item.name} is of type select but select options is not set`);
        }
        if (item.defaultValue && item.type === "number" && typeof item.defaultValue !== "number") {
          throw new Error(`
          App ${id}'s form attributes of name ${item.name} is of type number,
          but the default ${item.defaultValue} value is not a number`);
        }
      });
    }
  });

  return appsConfig;
};

