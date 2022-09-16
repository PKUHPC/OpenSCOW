import { Static, Type } from "@sinclair/typebox";

import { getDirConfig } from "../fileConfig";

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
  beforeScript: Type.String({ description: "启动应用之前的准备命令。具体参考文档" }),
  script: Type.String({ description: "启动应用的命令。可以使用beforeScript中定义的变量" }),
  connect: AppConnectPropsSchema,
});

export type WebAppConfigSchema = Static<typeof WebAppConfigSchema>;

export const VncAppConfigSchema = Type.Object({
  xstartup: Type.String({ description: "启动此app的xstartup脚本" }),
});

export type VncAppConfigSchema = Static<typeof VncAppConfigSchema>;

export const AppConfigSchema = Type.Object({
  name: Type.String({ description: "App名" }),
  nodes: Type.Optional(
    Type.Array(
      Type.String({ description: "节点地址" }),
      { description: "支持启动这个App的节点名。如果不设置，则所有节点都可以运行" },
    )),
  type: Type.Enum(AppType, { description: "应用类型" }),
  web: Type.Optional(WebAppConfigSchema),
  vnc: Type.Optional(VncAppConfigSchema),
});

export type AppConfigSchema = Static<typeof AppConfigSchema>;

export const APP_CONFIG_BASE_PATH = "apps";

export const getAppConfigs = (baseConfigPath?: string): Record<string, AppConfigSchema> => {

  const appsConfig = getDirConfig(AppConfigSchema, APP_CONFIG_BASE_PATH, baseConfigPath);

  Object.entries(appsConfig).forEach(([id, config]) => {
    if (!config[config.type]) {
      throw new Error(`App ${id} is of type ${config.type} but config.${config.type} is not set`);
    }
  });

  return appsConfig;
};

