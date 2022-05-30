import {
  AppleOutlined,
  BookOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  DesktopOutlined,
  FolderOutlined,
  MacCommandOutlined,
  PlusCircleOutlined,
  SaveOutlined } from "@ant-design/icons";
import React from "react";
import { NavItemProps } from "src/layouts/NavItemProps";
import { CLUSTERS, publicConfig } from "src/utils/config";

export const userRoutes: NavItemProps[] = [
  {
    Icon: DashboardOutlined,
    text: "仪表盘",
    path: "/dashboard",
  },
  ...publicConfig.ENABLE_JOB_MANAGEMENT ? [{
    Icon: BookOutlined,
    text: "作业",
    path: "/jobs",
    clickToPath: "/jobs/runningJobs",
    children: [
      {
        Icon: BookOutlined,
        text: "未结束的作业",
        path: "/jobs/runningJobs",
      },
      {
        Icon: PlusCircleOutlined,
        text: "提交作业",
        path: "/jobs/submit",
      },
      {
        Icon: SaveOutlined,
        text: "已保存的作业",
        path: "/jobs/savedJobs",
      },
    ],
  }] : [],
  ...publicConfig.ENABLE_SHELL ? [{
    Icon: MacCommandOutlined,
    text: "Shell",
    path: "/shell",
    clickToPath: CLUSTERS.length === 1 ? `/shell/${CLUSTERS[0].id}` : undefined,
    openInNewPage: true,
    clickable: CLUSTERS.length === 1,
    children: CLUSTERS.map(({ name, id }) => ({
      openInNewPage: true,
      Icon: CloudServerOutlined,
      text: name,
      path: `/shell/${id}`,
    }) as NavItemProps),
  } as NavItemProps] : [],
  {
    Icon: AppleOutlined,
    text: "交互式应用",
    clickToPath: "/apps/desktop",
    path: "/apps",
    children: [
      {
        Icon: DesktopOutlined,
        text: "桌面",
        path: "/apps/desktop",
      },
      {
        Icon: DesktopOutlined,
        text: "应用",
        path: "/apps/sessions",
      },
      {
        Icon: DesktopOutlined,
        text: "创建应用",
        clickable: false,
        path: "/apps/create",
        children: publicConfig.APPS.map(({ id, name }) => ({
          Icon: DesktopOutlined,
          text: name,
          path: `/apps/create/${id}`,
        })),
      },
    ],
  },
  ...publicConfig.FILE_SERVERS.length > 0 ? [{
    Icon: FolderOutlined,
    text: "文件管理",
    path: "/files",
    clickToPath: publicConfig.FILE_SERVERS.length === 1
      ? `/files/${publicConfig.FILE_SERVERS[0]}/~` : undefined,
    clickable: publicConfig.FILE_SERVERS.length === 1,
    children: publicConfig.FILE_SERVERS.map((cluster) => ({
      Icon: FolderOutlined,
      text: publicConfig.CLUSTER_NAMES[cluster] ?? cluster,
      path: `/files/${cluster}`,
      clickToPath: `/files/${cluster}/~`,
    }) as NavItemProps),
  }] : [],
];

export const iconToNode = (Icon: any) => {
  return React.isValidElement(Icon)
    ? Icon
    : <Icon />;
};
