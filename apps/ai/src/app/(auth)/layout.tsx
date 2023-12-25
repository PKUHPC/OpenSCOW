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
  DatabaseOutlined, FileImageOutlined, FolderOutlined, Loading3QuartersOutlined,
  LockOutlined, OneToOneOutlined,
  PlusOutlined, SaveOutlined, ShareAltOutlined, TeamOutlined, UngroupOutlined, UserOutlined } from "@ant-design/icons";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import React from "react";
import { useUserQuery } from "src/app/auth";
import { Loading } from "src/components/Loading";
import { BaseLayout } from "src/layouts/base/BaseLayout";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { NotAuthorizedPage } from "src/layouts/error/NotAuthorizedPage";
import { ServerErrorPage } from "src/layouts/error/ServerErrorPage";
import { trpc } from "src/utils/trpc";

import { PublicConfigContext } from "./context";
import { defaultClusterContext } from "./defaultClusterContext";


const useConfigQuery = () => {
  return trpc.config.publicConfig.useQuery();
};

export default function Layout(
  { children }:
  { children: React.ReactNode },
) {

  const userQuery = useUserQuery();
  const configQuery = useConfigQuery();

  if (userQuery.isLoading) {
    return (
      <BaseLayout>
        <Loading />
      </BaseLayout>
    );
  }

  if (userQuery.isError || !userQuery.data.user) {
    return (
      <BaseLayout>
        <NotAuthorizedPage />
      </BaseLayout>
    );
  }

  if (configQuery.isLoading) {
    return (
      <BaseLayout user={userQuery.data.user}>
        {children}
      </BaseLayout>
    );
  }

  if (configQuery.isError) {
    return (
      <BaseLayout>
        <ServerErrorPage />
      </BaseLayout>
    );
  }

  const publicConfig = configQuery.data;
  const { defaultCluster, setDefaultCluster } = defaultClusterContext(publicConfig.CLUSTERS);

  const routes = [
    {
      Icon: DashboardOutlined,
      text: "仪表盘",
      path: "/dashboard",
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
      clickToPath: "",
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
      Icon: UngroupOutlined,
      text: "算法",
      path: "/algorithm",
      clickToPath: "",
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
      Icon: BookOutlined,
      text: "作业",
      path: "/jobs",
      clickToPath: "/jobs/runningJobs",
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
      Icon: OneToOneOutlined,
      text: "模型",
      path: "/modal",
      clickToPath: "",
      children: [
        {
          Icon: LockOutlined,
          text: "我的模型",
          path: "/modal/private",
        },
        {
          Icon: ShareAltOutlined,
          text: "公共模型",
          path: "/modal/public",
        },
      ],
    },
    ...(publicConfig.CLUSTERS.length > 0 ? [
      {
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
          handleClick: () => { setDefaultCluster(cluster); },
        } as NavItemProps)),
      },
    ] : []),
  ];

  return (
    <BaseLayout routes={routes} user={userQuery.data.user}>
      <PublicConfigContext.Provider value={{
        user: userQuery.data.user,
        publicConfig,
        clusters: publicConfig.CLUSTERS,
        defaultClusterContext: defaultClusterContext(publicConfig.CLUSTERS ?? []),
      }}
      >
        {children}
      </PublicConfigContext.Provider>
    </BaseLayout>
  );

}
