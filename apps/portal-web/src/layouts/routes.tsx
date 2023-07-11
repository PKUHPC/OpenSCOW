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

import {
  BookOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  DesktopOutlined,
  EyeOutlined,
  FolderOutlined,
  LinkOutlined,
  Loading3QuartersOutlined,
  MacCommandOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SaveOutlined } from "@ant-design/icons";
import { NavItemProps } from "@scow/lib-web/build/layouts/base/types";
import { NavIcon } from "@scow/lib-web/build/layouts/icon";
import { join } from "path";
import { User } from "src/stores/UserStore";
import { Cluster, publicConfig } from "src/utils/config";

export const userRoutes: (
  user: User | undefined, defaultCluster: Cluster,
) => NavItemProps[] = (user, defaultCluster) => {

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
      clickToPath: join(publicConfig.BASE_PATH, "shell", defaultCluster.id),
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
    ...(publicConfig.ENABLE_APPS && publicConfig.CLUSTERS.length > 0 ? [{
      Icon: EyeOutlined,
      text: "交互式应用",
      path: "/apps",
      clickToPath: `/apps/${defaultCluster.id}/sessions`,
      clickable: true,
      children: publicConfig.CLUSTERS.map((cluster) => ({
        Icon: FolderOutlined,
        text: cluster.name,
        path: `/apps/${cluster.id}`,
        clickToPath: `/apps/${cluster.id}/sessions`,
        children: [
          {
            Icon: Loading3QuartersOutlined,
            text: "已创建的应用",
            path: `/apps/${cluster.id}/sessions`,
          },
          {
            Icon: PlusOutlined,
            text: "创建应用",
            clickable: false,
            path: `/apps/${cluster.id}/createApps`,
          },
        ],
      } as NavItemProps)),
    } as NavItemProps] : []),
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
    ...(publicConfig.NAV_LINKS && publicConfig.NAV_LINKS.length > 0
      ? publicConfig.NAV_LINKS.map((link) => ({
        Icon: !link.iconPath ? LinkOutlined : (
          <NavIcon
            src={join(publicConfig.PUBLIC_PATH, link.iconPath)}
          />
        ),
        text: link.text,
        path: link.url ? `${link.url}?token=${user.token}`
          : link.children?.length && link.children?.length > 0
            ? `${link.children[0].url}?token=${user.token}` : "",
        clickable: true,
        openInNewPage: link.openInNewPage,
        children: link.children?.length ? link.children?.map((childLink) => ({
          Icon: !childLink.iconPath ? LinkOutlined : (
            <NavIcon
              src={join(publicConfig.PUBLIC_PATH, childLink.iconPath)}
            />
          ),
          text: childLink.text,
          path: `${childLink.url}?token=${user.token}`,
          clickable: true,
          openInNewPage: childLink.openInNewPage,
        } as NavItemProps)) : [],
      }) as NavItemProps) : []),
  ];
};

