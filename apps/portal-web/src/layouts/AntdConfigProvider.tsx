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

import "dayjs/locale/zh-cn";

import { SYSTEM_VALID_LANGUAGES } from "@scow/config/build/i18n";
import { AntdConfigProvider as LibAntdConfigProvider } from "@scow/lib-web/build/layouts/AntdConfigProvider";
import { useDarkMode } from "@scow/lib-web/build/layouts/darkMode";
import { App, ConfigProvider, theme } from "antd";
import { Locale } from "antd/lib/locale";
import enUSlocale from "antd/locale/en_US";
import zhCNlocale from "antd/locale/zh_CN";
import React from "react";
import { useI18n } from "src/i18n";
import { ThemeProvider } from "styled-components";

type Props = React.PropsWithChildren<{
  color: string;
  locale: string;
}>;

const StyledComponentsThemeProvider: React.FC<Props> = ({ children }) => {
  const { token } = theme.useToken();

  return (
    <ThemeProvider theme={{ token }}>
      {children}
    </ThemeProvider>
  );
};

export const AntdConfigProvider: React.FC<Props> = ({ children, color, locale }) => {

  const { dark } = useDarkMode();

  const currentLangId = useI18n().currentLanguage.id;
  const localizedLang = locale ? getAntdLocale(locale) : getAntdLocale(currentLangId);

  return (
    <LibAntdConfigProvider color={color} locale={locale}>
      <ConfigProvider
        locale={localizedLang}
        theme={{ token: {
          colorPrimary: color,
          colorInfo: color,
        }, algorithm: dark ? theme.darkAlgorithm : undefined }}
      >
        <StyledComponentsThemeProvider color={color} locale={locale}>
          <App>
            {children}
          </App>
        </StyledComponentsThemeProvider>
      </ConfigProvider>
    </LibAntdConfigProvider>
  );
};

function getAntdLocale(langId: string): Locale {
  switch (langId) {
    case SYSTEM_VALID_LANGUAGES.ZH_CN:
      return zhCNlocale;
    case SYSTEM_VALID_LANGUAGES.EN:
    default:
      return enUSlocale;
  }
}
