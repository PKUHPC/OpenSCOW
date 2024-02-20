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

import { DesktopOutlined, RobotOutlined } from "@ant-design/icons";
import { UiExtensionStore } from "@scow/lib-web/build/extensions/UiExtensionStore";
import { BaseLayout as LibBaseLayout } from "@scow/lib-web/build/layouts/base/BaseLayout";
import { JumpToAnotherLink } from "@scow/lib-web/build/layouts/base/header/components";
import { PropsWithChildren, useMemo } from "react";
import { useStore } from "simstate";
import { LanguageSwitcher } from "src/components/LanguageSwitcher";
import { useI18n, useI18nTranslateToString } from "src/i18n";
import { getAvailableRoutes } from "src/layouts/routes";
import { UserStore } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";


interface Props {
  footerText: string;
  versionTag: string | undefined;
  initialLanguage: string;
}

export const BaseLayout =
({ footerText, versionTag, initialLanguage, children }: PropsWithChildren<Props>) => {

  const userStore = useStore(UserStore);

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const systemLanguageConfig = publicConfig.SYSTEM_LANGUAGE_CONFIG;

  const routes = useMemo(() => getAvailableRoutes(userStore.user, t), [userStore.user, t]);

  const uiExtensionStore = useStore(UiExtensionStore);

  return (
    <LibBaseLayout
      logout={userStore.logout}
      user={userStore.user}
      routes={routes}
      footerText={footerText}
      versionTag={versionTag}
      basePath={publicConfig.BASE_PATH}
      userLinks={publicConfig.USER_LINKS}
      from="mis"
      extension={uiExtensionStore.config}
      languageId={languageId}
      headerRightContent={(
        <>
          <JumpToAnotherLink
            user={userStore.user}
            icon={<DesktopOutlined style={{ paddingRight: 2 }} />}
            link={publicConfig.PORTAL_URL}
            linkText={t("layouts.route.navLinkTextPortal")}
          />
          <JumpToAnotherLink
            user={userStore.user}
            icon={<RobotOutlined style={{ paddingRight: 2 }} />}
            link={publicConfig.AI_URL}
            linkText={t("layouts.route.navLinkTextAI")}
          />
          {
            systemLanguageConfig.isUsingI18n ? (
              <LanguageSwitcher initialLanguage={initialLanguage} />
            ) : undefined
          }
        </>
      )}
    >
      {children}
    </LibBaseLayout>
  );
};
