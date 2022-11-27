import {
  BookOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  DesktopOutlined,
  EyeOutlined,
  FolderOutlined,
  Loading3QuartersOutlined,
  MacCommandOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SaveOutlined } from "@ant-design/icons";
import React from "react";
import { App } from "src/generated/portal/app";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { User } from "src/stores/UserStore";
import { Cluster, publicConfig } from "src/utils/config";

export const userRoutes: (
  user: User | undefined, defaultCluster: Cluster, apps: App[],
) => NavItemProps[] = (user, defaultCluster, apps) => {

  if (!user) { return []; }

  return [
    {
      Icon: DashboardOutlined,
      text: "仪表盘",
      path: "/dashboard",
    },
    ...(publicConfig.ENABLE_JOB_MANAGEMENT ? [{
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
          Icon: BookOutlined,
          text: "所有作业",
          path: "/jobs/allJobs",
        },
        {
          Icon: PlusCircleOutlined,
          text: "提交作业",
          path: "/jobs/submit",
        },
        {
          Icon: SaveOutlined,
          text: "作业模板",
          path: "/jobs/savedJobs",
        },
      ],
    }] : []),
    ...(publicConfig.ENABLE_SHELL ? [{
      Icon: MacCommandOutlined,
      text: "Shell",
      path: "/shell",
      clickToPath: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/shell/${defaultCluster.id}`,
      openInNewPage: true,
      clickable: true,
      children: publicConfig.CLUSTERS.map(({ name, id }) => ({
        openInNewPage: true,
        Icon: CloudServerOutlined,
        text: name,
        path: `/shell/${id}`,
      } as NavItemProps)),
    } as NavItemProps] : []),
    ...(publicConfig.ENABLE_LOGIN_DESKTOP ? [{
      Icon: DesktopOutlined,
      text: "桌面",
      path: "/desktop",
    }] : []),
    ...(publicConfig.ENABLE_APPS ? [{
      Icon: EyeOutlined,
      text: "交互式应用",
      path: "/apps",
      clickToPath: "/apps/sessions",
      children: [
        {
          Icon: Loading3QuartersOutlined,
          text: "已创建的应用",
          path: "/apps/sessions",
        },
        ...(apps.length > 0 ? [
          {
            Icon: PlusOutlined,
            text: "创建应用",
            clickable: false,
            path: "/apps/create",
            children: apps.map(({ id, name }) => ({
              Icon: DesktopOutlined,
              text: name,
              path: `/apps/create/${id}`,
            })),
          }] : []),
      ],
    }] : []),
    ...(publicConfig.CLUSTERS.length > 0 ? [{
      Icon: FolderOutlined,
      text: "文件管理",
      path: "/files",
      clickToPath: `/files/${defaultCluster.id}/~`,
      clickable: true,
      children: publicConfig.CLUSTERS.map((cluster) => ({
        Icon: FolderOutlined,
        text: cluster.name,
        path: `/files/${cluster.id}`,
        clickToPath: `/files/${cluster.id}/~`,
      } as NavItemProps)),
    }] : []),
  ];
};

export const iconToNode = (Icon: any) => {
  return React.isValidElement(Icon)
    ? Icon
    : <Icon />;
};
