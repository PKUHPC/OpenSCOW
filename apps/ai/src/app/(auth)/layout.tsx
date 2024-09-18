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

import { DatabaseOutlined, DesktopOutlined } from "@ant-design/icons";
import React from "react";
import { useUserQuery } from "src/app/auth";
import { Loading } from "src/components/Loading";
import { BaseLayout } from "src/layouts/base/BaseLayout";
import { JumpToAnotherLink } from "src/layouts/base/header/Components";
import { ServerErrorPage } from "src/layouts/error/ServerErrorPage";
import { trpc } from "src/utils/trpc";

import { useUiConfig } from "../uiContext";
import { PublicConfigContext } from "./context";
import { defaultClusterContext } from "./defaultClusterContext";
import { userRoutes } from "./routes";


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
    return;
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
  const { setDefaultCluster, defaultCluster } = defaultClusterContext(publicConfig.CLUSTERS);

  const { hostname, uiConfig } = useUiConfig();
  const footerConfig = uiConfig.config.footer;
  const footerText = (hostname && footerConfig?.hostnameMap?.[hostname])
    ?? footerConfig?.defaultText ?? "";

  const routes = userRoutes(userQuery.data.user, publicConfig, setDefaultCluster, defaultCluster);

  return (
    <BaseLayout
      routes={routes}
      user={userQuery.data.user}
      headerRightContent={(
        <>
          <JumpToAnotherLink
            user={userQuery.data.user}
            icon={<DatabaseOutlined style={{ paddingRight: 2 }} />}
            link={publicConfig.MIS_URL}
            // linkText={t("baseLayout.linkTextMis")}
            linkText="管理系统"
          />
          <JumpToAnotherLink
            user={userQuery.data.user}
            icon={<DesktopOutlined style={{ paddingRight: 2 }} />}
            link={publicConfig.PORTAL_URL}
            // linkText={t("baseLayout.linkTextAI")}
            linkText="HPC"
          />
          {/* {
            systemLanguageConfig.isUsingI18n ? (
              <LanguageSwitcher initialLanguage={initialLanguage} />
            ) : undefined
          } */}
        </>
      )}
      versionTag={publicConfig.VERSION_TAG}
      footerText={footerText}
    >
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
