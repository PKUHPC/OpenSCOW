"use client";
import { App, ConfigProvider, theme } from "antd";
import enUSlocale from "antd/locale/en_US";
import zhCNlocale from "antd/locale/zh_CN";
import { useContext } from "react";
import { ThemeProvider } from "styled-components";

import { ScowParamsContext } from "../ScowParamsProvider";

type Props = React.PropsWithChildren<{
  color: string | undefined;
}>;

const StyledComponentsThemeProvider: React.FC<Props> = ({ children }) => {
  const { token } = theme.useToken();

  return (
    <ThemeProvider theme={{ token }}>
      {children}
    </ThemeProvider>
  );
};

export const AntdConfigProvider: React.FC<Props> = ({ children, color }) => {

  const { scowDark, scowLangId } = useContext(ScowParamsContext);

  return (
    <ConfigProvider
      locale={ scowLangId === "zh_cn" ? zhCNlocale : enUSlocale}
      theme={{ token: { colorPrimary: color, colorInfo: color },
        algorithm: scowDark ? theme.darkAlgorithm : undefined }}
    >
      <StyledComponentsThemeProvider color={color}>
        <App>
          {children}
        </App>
      </StyledComponentsThemeProvider>
    </ConfigProvider>
  );
};
