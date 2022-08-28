import { Static, Type } from "@sinclair/typebox";
import { GetConfigFn, getConfigFromFile } from "src/fileConfig";

export const PortalConfigSchema = Type.Object({
  jobManagement: Type.Boolean({ description: "是否启动作业管理功能", default: true }),

  loginDesktop: Type.Object({
    enabled: Type.Boolean({ description: "是否启动登录节点上的桌面功能", default: true }),
    wms: Type.Array(
      Type.Object({ name: Type.String({ description: "名称" }), wm: Type.String({ description: "wm值" }) }),
      { default: [{ name: "xfce", wm: "xfce" }]}),
    maxDesktops: Type.Integer({ description: "最多创建多少个桌面", default: 3 }),
  }),

  apps: Type.Boolean({ description: "是否启用交互式任务功能", default: true }),

  homeText: Type.Object({
    defaultText: Type.String({ description: "默认主页文本", default: "Super Computing on Web" }),
    hostnameMap: Type.Record(
      Type.String(), Type.String(),
      { description: "根据域名(hostname，不包括port)不同，显示在主页上的文本", default: {} },
    ),
  }),

  homeTitle: Type.Object({
    defaultText: Type.String({ description: "默认主页标题", default: "SCOW" }),
    hostnameMap: Type.Record(
      Type.String(), Type.String(),
      { description: "根据域名(hostname，不包括port)不同，显示在主页上的标题", default: {} },
    ),
  }),

  misUrl: Type.Optional(Type.String({ description: "管理系统的部署URL或者路径" })),

  shell: Type.Boolean({ description: "是否启用终端功能", default: true }),

  submitJobDefaultPwd: Type.String({
    description: "提交作业的默认工作目录。使用{{ name }}代替作业名称。相对于用户的家目录", default: "scow/jobs/{{ name }}" }),

  savedJobsDir: Type.String({ description: "将保存的作业保存到什么位置。相对于用户家目录", default: "scow/savedJobs" }),

  appJobsDir: Type.String({ description: "将交互式任务的信息保存到什么位置。相对于用户的家目录", default: "scow/appData" }),

  turboVNCPath: Type.String({ description: "TurboVNC的安装路径", default: "/opt/TurboVNC" }),

});

const PORTAL_CONFIG_NAME = "portal";

export type PortalConfigSchema = Static<typeof PortalConfigSchema>;

export const getPortalConfig: GetConfigFn<PortalConfigSchema> = (baseConfigPath) =>
  getConfigFromFile(PortalConfigSchema, PORTAL_CONFIG_NAME, baseConfigPath);
