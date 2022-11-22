import "dayjs/locale/zh-cn";

import { ConfigProvider, theme } from "antd";
import zhCNlocale from "antd/locale/zh_CN";
import React, { } from "react";
import { AppFloatButtons } from "src/layouts/AppFloatButtons";
import { useDarkMode } from "src/layouts/darkMode";
import { MessageProvider, ModalProvider } from "src/layouts/prompts";
import { ThemeProvider } from "styled-components";


type Props = React.PropsWithChildren<{
  color: string;
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

  const { dark } = useDarkMode();

  return (
    <ConfigProvider
      locale={zhCNlocale}
      theme={{ token: { colorPrimary: color }, algorithm: dark ? theme.darkAlgorithm : undefined }}
    >
      <StyledComponentsThemeProvider color={color}>
        <MessageProvider>
          <ModalProvider>
            <AppFloatButtons />
            {children}
          </ModalProvider>
        </MessageProvider>
      </StyledComponentsThemeProvider>
    </ConfigProvider>
  );
};
