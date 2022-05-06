import {
  CloudServerOutlined,
  DashboardOutlined,
  DesktopOutlined,
  FolderOutlined,
  MacCommandOutlined } from "@ant-design/icons";
import React from "react";
import { NavItemProps } from "src/layouts/NavItemProps";
import { CLUSTERS, publicConfig } from "src/utils/config";

export const userRoutes: NavItemProps[] = [
  {
    Icon: DashboardOutlined,
    text: "仪表盘",
    path: "/dashboard",
  },
  ...publicConfig.ENABLE_SHELL ? [{
    Icon: MacCommandOutlined,
    text: "Shell",
    path: "/shell",
    clickToPath: CLUSTERS.length === 1 ? `/shell/${CLUSTERS[0].id}` : undefined,
    clickable: CLUSTERS.length === 1,
    children: CLUSTERS.map(({ name, id }) => ({
      extraLinkProps: { target: "_blank" },
      Icon: CloudServerOutlined,
      text: name,
      path: `/shell/${id}`,
    })),
  }] : [],
  ...publicConfig.ENABLE_VNC ? [{
    Icon: DesktopOutlined,
    text: "桌面",
    path: "/apps/desktop",
  }] : [],
  ...publicConfig.FILE_SERVERS.length > 0 ? [{
    Icon: FolderOutlined,
    text: "文件管理",
    path: "/files",
    clickToPath: publicConfig.FILE_SERVERS.length === 1
      ? `/files/${publicConfig.FILE_SERVERS[0]}` : undefined,
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
