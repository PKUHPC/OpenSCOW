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

"use client";

import { BookOutlined, DashboardOutlined,
  DatabaseOutlined, FileImageOutlined, FolderOutlined, LinkOutlined, LockOutlined, OneToOneOutlined,
  PlusOutlined, ShareAltOutlined, UngroupOutlined } from "@ant-design/icons";
import { NavIcon } from "@scow/lib-web/build/layouts/icon";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { join } from "path";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { ClientUserInfo } from "src/server/trpc/route/auth";
import { Cluster, NavLink, PublicConfig } from "src/server/trpc/route/config";

export const userRoutes: (
  user: ClientUserInfo | undefined,
  publicConfig: PublicConfig,
  setDefaultCluster: (cluster: Cluster) => void,
  defaultCluster: Cluster,
) => NavItemProps[] = (user, publicConfig, setDefaultCluster, defaultCluster) => {

  if (!user) { return []; }

  return [
    {
      Icon: DashboardOutlined,
      text: "仪表盘",
      path: "/dashboard",
      clickToPath: "/dashboard",
    },
    {
      Icon: DatabaseOutlined,
      text: "数据",
      path: "/dataset",
      clickToPath: "/dataset/private",
      children: [
        {
          Icon: LockOutlined,
          text: "我的数据集",
          path: "/dataset/private",
        },
        {
          Icon: ShareAltOutlined,
          text: "公共数据集",
          path: "/dataset/public",
        },
      ],
    },
    {
      Icon: FileImageOutlined,
      text: "镜像",
      path: "/image",
      clickToPath: "/image/private",
      children: [
        {
          Icon: LockOutlined,
          text: "我的镜像",
          path: "/image/private",
        },
        {
          Icon: ShareAltOutlined,
          text: "公共镜像",
          path: "/image/public",
        },
      ],
    },
    {
      Icon: BookOutlined,
      text: "作业",
      path: "/jobs",
      clickToPath: `/jobs/${defaultCluster.id}/createApps`,
      children: [
        ...publicConfig.CLUSTERS.map((cluster) => ({
          Icon: FolderOutlined,
          text: getI18nConfigCurrentText(cluster.name, undefined),
          path: `/jobs/${cluster.id}`,
          clickable: false,
          children:[
            {
              Icon: PlusOutlined,
              text: "创建应用",
              path: `/jobs/${cluster.id}/createApps`,
            },
            {
              Icon: PlusOutlined,
              text: "训练",
              path: `/jobs/${cluster.id}/trainJobs`,
            },
            {
              Icon: BookOutlined,
              text: "正在运行的作业",
              path: `/jobs/${cluster.id}/runningJobs`,
            },
            {
              Icon: BookOutlined,
              text: "已完成的作业",
              path: `/jobs/${cluster.id}/historyJobs`,
            },
          ],
        })),
      ],
    },
    {
      Icon: UngroupOutlined,
      text: "算法",
      path: "/algorithm",
      clickToPath: "/algorithm/private",
      children: [
        {
          Icon: LockOutlined,
          text: "我的算法",
          path: "/algorithm/private",
        },
        {
          Icon: ShareAltOutlined,
          text: "公共算法",
          path: "/algorithm/public",
        },
      ],
    },
    {
      Icon: OneToOneOutlined,
      text: "模型",
      path: "/model",
      clickToPath: "/model/private",
      children: [
        {
          Icon: LockOutlined,
          text: "我的模型",
          path: "/model/private",
        },
        {
          Icon: ShareAltOutlined,
          text: "公共模型",
          path: "/model/public",
        },
      ],
    },
    ...(publicConfig.CLUSTERS.length > 0 ? [
      {
        Icon: FolderOutlined,
        text: "文件管理",
        path: "/files",
        clickToPath: `/files/${defaultCluster.id}/~`,
        children: publicConfig.CLUSTERS.map((cluster) => ({
          Icon: FolderOutlined,
          text: cluster.name,
          path: `/files/${cluster.id}`,
          clickToPath: `/files/${cluster.id}/~`,
          handleClick: () => { setDefaultCluster(cluster); },
        } as NavItemProps)),
      },
    ] : []),
    ...(publicConfig.NAV_LINKS && publicConfig.NAV_LINKS.length > 0
      ? publicConfig.NAV_LINKS.map((link) => {

        const parentNavPath = link.url ? `${link.url}?token=${user.token}`
          : link.children?.length && link.children?.length > 0
            ? `${link.children[0].url}?token=${user.token}` : "";

        return {
          Icon: !link.iconPath ? LinkOutlined : (
            <NavIcon
              src={join(publicConfig.PUBLIC_PATH, link.iconPath)}
            />
          ),
          text: link.text,
          path: parentNavPath,
          clickToPath: parentNavPath,
          clickable: true,
          openInNewPage: link.openInNewPage,
          children: link.children?.length ? link.children?.map((childLink: Omit<NavLink, "children" | "url"> & {
            url: string;
          }) => ({
            Icon: !childLink.iconPath ? LinkOutlined : (
              <NavIcon
                src={join(publicConfig.PUBLIC_PATH, childLink.iconPath)}
              />
            ),
            text: childLink.text,
            path: `${childLink.url}?token=${user.token}`,
            clickToPath: `${childLink.url}?token=${user.token}`,
            clickable: true,
            openInNewPage: childLink.openInNewPage,
          } as NavItemProps)) : [],
        } as NavItemProps;
      }) : []),
  ];

};
