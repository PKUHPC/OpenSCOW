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

import { GetConfigFn, getConfigFromFile } from "@scow/lib-config";
import { Static, Type } from "@sinclair/typebox";
import { DEFAULT_CONFIG_BASE_PATH } from "src/constants";
import { createI18nStringSchema } from "src/i18n";

export const PortalConfigSchema = Type.Object({
  jobManagement: Type.Boolean({ description: "是否启动作业管理功能", default: true }),

  loginDesktop: Type.Object({
    enabled: Type.Boolean({ description: "是否启动登录节点上的桌面功能", default: true }),
    wms: Type.Array(
      Type.Object({ name: Type.String({ description: "名称" }), wm: Type.String({ description: "wm值" }) }),
      { default: [{ name: "xfce", wm: "xfce" }]}),
    maxDesktops: Type.Integer({ description: "最多创建多少个桌面", default: 3 }),
    desktopsDir: Type.String({ description: "将创建的登录节点桌面信息的保存到什么位置。相对于用户的家目录", default: "scow/desktops" }),
  }),

  apps: Type.Boolean({ description: "是否启用交互式任务功能", default: true }),

  submitJobPromptText:
  Type.Optional(createI18nStringSchema({
    description: "提交作业命令框中的提示语",
    defaultValue: "#此处参数设置的优先级高于页面其它地方，两者冲突时以此处为准" })),

  misUrl: Type.Optional(Type.String({ description: "管理系统的部署URL或者路径" })),

  aiUrl: Type.Optional(Type.String({ description: "AI系统的部署URL或者路径" })),

  shell: Type.Boolean({ description: "是否启用终端功能", default: true }),

  file: Type.Optional(Type.Object({
    preview: Type.Object({
      limitSize: Type.String({ description: "文件预览大小限制", default: "50m" }),
    }, { description: "文件预览功能", default: {} }),
    edit: Type.Object({
      limitSize: Type.String({ description: "文件编辑大小限制", default: "1m" }),
    }, { description: "文件编辑功能", default: {} }),
  }, { description: "文件管理" })),


  submitJobDefaultPwd: Type.String({
    description: "提交作业的默认工作目录。使用{{ name }}代替作业名称。相对于用户的家目录", default: "scow/jobs/{{ name }}" }),

  savedJobsDir: Type.String({ description: "将保存的作业保存到什么位置。相对于用户家目录", default: "scow/savedJobs" }),

  appJobsDir: Type.String({ description: "将交互式任务的信息保存到什么位置。相对于用户的家目录", default: "scow/appData" }),

  turboVNCPath: Type.String({ description: "TurboVNC的安装路径", default: "/opt/TurboVNC" }),

  appLastSubmissionDir: Type.String({
    description: "提交交互式应用上一次填写信息的默认工作目录。相对于用户的家目录", default: "scow/apps" }),

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

  uiExtension: Type.Optional(Type.Object({
    url: Type.String({ description: "UI扩展站完整URL" }),
  })),

});

const PORTAL_CONFIG_NAME = "portal";

export type PortalConfigSchema = Static<typeof PortalConfigSchema>;

export const getPortalConfig: GetConfigFn<PortalConfigSchema> = (baseConfigPath) =>
  getConfigFromFile(PortalConfigSchema, PORTAL_CONFIG_NAME, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);
