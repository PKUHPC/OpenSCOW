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
  CloudSyncOutlined,
  ClusterOutlined,
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
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { join } from "path";
import { useI18n, useI18nTranslateToString } from "src/i18n";
import { User } from "src/stores/UserStore";
import { Cluster, LoginNode, publicConfig } from "src/utils/config";
export const userRoutes: (
  user: User | undefined,
  defaultCluster: Cluster,
  LoginNodes: Record<string, LoginNode[]>,
  setDefaultCluster: (cluster: Cluster) => void,
) => NavItemProps[] = (user, defaultCluster, loginNodes, setDefaultCluster) => {

  if (!user) { return []; }
  const t = useI18nTranslateToString();

  const languageId = useI18n().currentLanguage.id;


  return [
    {
      Icon: DashboardOutlined,
      text: t("routes.dashboard"),
      path: "/dashboard",
    },
    ...(publicConfig.ENABLE_JOB_MANAGEMENT ? [{
      Icon: BookOutlined,
      text: t("routes.job.title"),
      path: "/jobs",
      clickToPath: "/jobs/runningJobs",
      children: [
        {
          Icon: BookOutlined,
          text: t("routes.job.runningJobs"),
          path: "/jobs/runningJobs",
        },
        {
          Icon: BookOutlined,
          text: t("routes.job.allJobs"),
          path: "/jobs/allJobs",
        },
        {
          Icon: PlusCircleOutlined,
          text: t("routes.job.submitJob"),
          path: "/jobs/submit",
        },
        {
          Icon: SaveOutlined,
          text: t("routes.job.jobTemplates"),
          path: "/jobs/savedJobs",
        },
      ],
    }] : []),
    ...(publicConfig.ENABLE_SHELL ? [{
      Icon: MacCommandOutlined,
      text: "Shell",
      path: "/shell",
      clickToPath:
        join(publicConfig.BASE_PATH, "shell", defaultCluster.id, loginNodes[defaultCluster.id]?.[0]?.address),
      openInNewPage: true,
      clickable: true,
      children: publicConfig.CLUSTERS.map(({ name, id }) => ({
        openInNewPage: true,
        Icon: CloudServerOutlined,
        text: getI18nConfigCurrentText(name, languageId),
        path: `/shell/${id}`,
        clickToPath: join(publicConfig.BASE_PATH, "shell", id, loginNodes[id]?.[0]?.address),
        handleClick: () => { setDefaultCluster({ name, id }); },
        children: loginNodes[id]?.map((loginNode) => ({
          openInNewPage: true,
          Icon: CloudServerOutlined,
          text: loginNode.name,
          path: `/shell/${id}/${loginNode.address}`,
          handleClick: () => { setDefaultCluster({ name, id }); },
        })),
      } as NavItemProps)),
    } as NavItemProps] : []),
    ...(publicConfig.ENABLE_LOGIN_DESKTOP ? [{
      Icon: DesktopOutlined,
      text: t("routes.desktop"),
      path: "/desktop",
    }] : []),
    ...(publicConfig.ENABLE_APPS && publicConfig.CLUSTERS.length > 0 ? [{
      Icon: EyeOutlined,
      text: t("routes.apps.title"),
      path: "/apps",
      clickToPath: `/apps/${defaultCluster.id}/sessions`,
      clickable: true,
      children: publicConfig.CLUSTERS.map((cluster) => ({
        Icon: FolderOutlined,
        text: getI18nConfigCurrentText(cluster.name, languageId),
        path: `/apps/${cluster.id}`,
        clickToPath: `/apps/${cluster.id}/sessions`,
        handleClick: () => { setDefaultCluster(cluster); },
        children: [
          {
            Icon: Loading3QuartersOutlined,
            text: t("routes.apps.appSessions"),
            path: `/apps/${cluster.id}/sessions`,
            handleClick: () => { setDefaultCluster(cluster); },
          },
          {
            Icon: PlusOutlined,
            text: t("routes.apps.createApp"),
            clickable: false,
            path: `/apps/${cluster.id}/createApps`,
            handleClick: () => { setDefaultCluster(cluster); },
          },
        ],
      } as NavItemProps)),
    } as NavItemProps] : []),
    ...(publicConfig.CLUSTERS.length > 0 ? [{
      Icon: FolderOutlined,
      text: t("routes.file.fileManager"),
      path: "/files",
      clickToPath: `/files/${defaultCluster.id}/~`,
      clickable: true,
      children: [
        {
          Icon: FolderOutlined,
          text: t("routes.file.clusterFileManager"),
          path: "/files/",
          clickToPath: `/files/${defaultCluster.id}/~`,
          children: publicConfig.CLUSTERS.map((cluster) => ({
            Icon: ClusterOutlined,
            text: getI18nConfigCurrentText(cluster.name, languageId),
            path: `/files/${cluster.id}`,
            clickToPath: `/files/${cluster.id}/~`,
            handleClick: () => { setDefaultCluster(cluster); },
          } as NavItemProps)),
        },
        ...(publicConfig.CROSS_CLUSTER_FILE_TRANSFER_ENABLED ? [
          {
            Icon: CloudSyncOutlined,
            text: t("routes.file.crossClusterFileTransfer"),
            path: "/files/fileTransfer",
          },
          {
            Icon: CloudServerOutlined,
            text: t("routes.file.transferProgress"),
            path: "/files/currentTransferInfo",
          },
        ] : []),
      ]},
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
          children: link.children?.length ? link.children?.map((childLink) => ({
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

