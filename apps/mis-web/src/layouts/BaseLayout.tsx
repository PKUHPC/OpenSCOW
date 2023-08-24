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

import { DesktopOutlined } from "@ant-design/icons";
import { BaseLayout as LibBaseLayout } from "@scow/lib-web/build/layouts/base/BaseLayout";
import { JumpToAnotherLink } from "@scow/lib-web/build/layouts/base/header/components";
import { useTranslation } from "next-i18next";
import { PropsWithChildren, useMemo } from "react";
import { useStore } from "simstate";
import { getAvailableRoutes } from "src/layouts/routes";
import { UserStore } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";

interface Props {
  footerText: string;
  versionTag: string | undefined;
}

// 导航文字翻译
const translateRoutes = (routes, t) => {
  return routes.map((route) => ({
    ...route,
    text: t(route.text as any),
    children: route.children ? translateRoutes(route.children, t) : null,
  }));
};

export const BaseLayout = ({ footerText, versionTag, children }: PropsWithChildren<Props>) => {

  const userStore = useStore(UserStore);

  const { t, i18n } = useTranslation("layouts");

  const routes = useMemo(() => getAvailableRoutes(userStore.user), [userStore.user]);

  const translatedRoutes = useMemo(() => translateRoutes(routes, t), [routes, t]);

  return (
    <LibBaseLayout
      logout={userStore.logout}
      user={userStore.user}
      routes={translatedRoutes}
      // routes={routes}
      footerText={footerText}
      versionTag={versionTag}
      basePath={publicConfig.BASE_PATH}
      userLinks={publicConfig.USER_LINKS}
      headerRightContent={(
        <>
          <JumpToAnotherLink
            user={userStore.user}
            icon={<DesktopOutlined style={{ paddingRight: 2 }} />}
            link={publicConfig.PORTAL_URL}
            // linkText={t("route.nav-link-text")}
            linkText={i18n.language === "zh_cn" ? "门户" : "PORTAL"}
          />
        </>
      )}
    >
      {children}
    </LibBaseLayout>
  );
};
