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

"use client";

import { BookOutlined, DashboardOutlined,
  DatabaseOutlined, FileImageOutlined, FolderOutlined, LinkOutlined, LockOutlined, OneToOneOutlined,
  PlusOutlined, ShareAltOutlined, UngroupOutlined } from "@ant-design/icons";
import { NavIcon } from "@scow/lib-web/build/layouts/icon";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { join } from "path";
import { useI18n, useI18nTranslateToString } from "src/i18n";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { ClientUserInfo } from "src/server/trpc/route/auth";
import { Cluster, NavLink, PublicConfig } from "src/server/trpc/route/config";

export const userRoutes: (
  user: ClientUserInfo | undefined,
  publicConfig: PublicConfig,
  currentClusters: Cluster[],
  setDefaultCluster: (cluster: Cluster | undefined) => void,
  defaultCluster: Cluster | undefined,
) => NavItemProps[] = (user, publicConfig, currentClusters, setDefaultCluster, defaultCluster) => {

  if (!user) { return []; }

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  return [
    {
      Icon: DashboardOutlined,
      text: t("routes.dashboard"),
      path: "/dashboard",
      clickToPath: "/dashboard",
    },
    {
      Icon: DatabaseOutlined,
      text: t("routes.data.title"),
      path: "/dataset",
      clickToPath: "/dataset/private",
      children: [
        {
          Icon: LockOutlined,
          text: t("routes.data.private"),
          path: "/dataset/private",
        },
        {
          Icon: ShareAltOutlined,
          text: t("routes.data.public"),
          path: "/dataset/public",
        },
      ],
    },
    {
      Icon: FileImageOutlined,
      text: t("routes.image.title"),
      path: "/image",
      clickToPath: "/image/private",
      children: [
        {
          Icon: LockOutlined,
          text: t("routes.image.private"),
          path: "/image/private",
        },
        {
          Icon: ShareAltOutlined,
          text: t("routes.image.public"),
          path: "/image/public",
        },
      ],
    },
    // 无可用集群时不显示该层级路由
    ...(currentClusters.length > 0 ? [ {
      Icon: BookOutlined,
      text: t("routes.job.title"),
      path: "/jobs",
      clickToPath: `/jobs/${defaultCluster?.id ?? currentClusters[0].id}/createApps`,
      children: [
        ...currentClusters.map((cluster) => ({
          Icon: FolderOutlined,
          text: getI18nConfigCurrentText(cluster.name, languageId),
          path: `/jobs/${cluster.id}`,
          clickable: false,
          children:[
            {
              Icon: PlusOutlined,
              text: t("routes.job.createApp"),
              path: `/jobs/${cluster.id}/createApps`,
            },
            {
              Icon: PlusOutlined,
              text: t("routes.job.trainJob"),
              path: `/jobs/${cluster.id}/trainJobs`,
            },
            {
              Icon: BookOutlined,
              text: t("routes.job.runningJobs"),
              path: `/jobs/${cluster.id}/runningJobs`,
            },
            {
              Icon: BookOutlined,
              text: t("routes.job.historyJobs"),
              path: `/jobs/${cluster.id}/historyJobs`,
            },
          ],
        })),
      ],
    },
    ] : []),
    {
      Icon: UngroupOutlined,
      text: t("routes.algorithm.title"),
      path: "/algorithm",
      clickToPath: "/algorithm/private",
      children: [
        {
          Icon: LockOutlined,
          text: t("routes.algorithm.private"),
          path: "/algorithm/private",
        },
        {
          Icon: ShareAltOutlined,
          text: t("routes.algorithm.public"),
          path: "/algorithm/public",
        },
      ],
    },
    {
      Icon: OneToOneOutlined,
      text: t("routes.model.title"),
      path: "/model",
      clickToPath: "/model/private",
      children: [
        {
          Icon: LockOutlined,
          text: t("routes.model.private"),
          path: "/model/private",
        },
        {
          Icon: ShareAltOutlined,
          text: t("routes.model.public"),
          path: "/model/public",
        },
      ],
    },
    ...(currentClusters.length > 0 ? [
      {
        Icon: FolderOutlined,
        text: t("routes.file"),
        path: "/files",
        clickToPath: `/files/${defaultCluster?.id ?? currentClusters[0].id}/~`,
        children: currentClusters.map((cluster) => ({
          Icon: FolderOutlined,
          text: getI18nConfigCurrentText(cluster.name, languageId),
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
