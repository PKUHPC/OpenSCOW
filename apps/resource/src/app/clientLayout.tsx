"use client";

import { legacyLogicalPropertiesTransformer, StyleProvider } from "@ant-design/cssinjs";
import { DEFAULT_PRIMARY_COLOR } from "@scow/config/build/ui";
import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AntdConfigProvider } from "src/components/layout/AntdConfigProvider";
import { DarkModeProvider } from "src/components/layout/DarkModeProvider";
import { ErrorBoundary } from "src/components/layout/ErrorBoundary";
import { GlobalStyle } from "src/components/layout/globalStyle";
import { Loading } from "src/components/layout/Loading";
import { AntdStyleRegistry } from "src/components/layout/styleRegistry/AntdRegistry";
import StyledComponentsRegistry from "src/components/layout/styleRegistry/StyledComponentsRegistry";
import { ScowParamsProvider } from "src/components/ScowParamsProvider";
import { ServerErrorPage } from "src/components/ServerErrorPage";
import { trpc } from "src/server/trpc/api";
import { UiConfig } from "src/server/trpc/route/config";

import { UiConfigContext } from "./uiContext";

const useReportHeightToScow = () => {

  useEffect(() => {
    // postIframeMessage();
    const sendMessage = (height: number) => {
      window.parent?.postMessage({
        type: "scow.extensionPageHeightChanged", // 发送信息的类型，不允许更改
        payload: {
          height: height,
        },
      }, "*");
    };

    const observer = new ResizeObserver((entries) => {
      const e = entries[0];
      sendMessage(e.contentRect.height < 800 ? 800 : e.contentRect.height);
    });


    const htmlElement = document.querySelector("html")!;

    sendMessage(htmlElement.getBoundingClientRect().height + 20);

    observer.observe(htmlElement);

    return () => {
      observer.disconnect();
    };

  }, []);
};

export function ClientLayout(props: {
  children: React.ReactNode,
}) {
  const pathname = usePathname();

  useReportHeightToScow();

  const useConfigQuery = () => {
    return trpc.config.getUiConfig.useQuery(undefined, {
      staleTime: Infinity,
    });
  };

  const useConfig = useConfigQuery();

  const uiConfig = useConfig.data || {} as UiConfig;

  const host = (typeof window === "undefined") ? "" : location.host;
  const hostname = host?.includes(":") ? host?.split(":")[0] : host;
  const primaryColor = uiConfig.config?.primaryColor;
  const color = (hostname && primaryColor?.hostnameMap?.[hostname])
    ?? primaryColor?.defaultColor ?? uiConfig.defaultPrimaryColor;

  const darkModeColor = (hostname && primaryColor?.hostnameMap?.[hostname])
    ?? primaryColor?.darkModeColor ?? color;

  return (
    <Suspense>
      <ScowParamsProvider>
        <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
          <StyledComponentsRegistry>
            <AntdStyleRegistry>
              <body>
                {
                  useConfig.isLoading ? (
                    <AntdConfigProvider
                      color={DEFAULT_PRIMARY_COLOR}
                      primaryColor={{ defaultColor: color,darkModeColor }}
                    >
                      <Loading />
                    </AntdConfigProvider>
                  ) : (
                    <DarkModeProvider>
                      <AntdConfigProvider color={color} primaryColor={{ defaultColor: color,darkModeColor }}>
                        <GlobalStyle />
                        <ErrorBoundary Component={ServerErrorPage} pathname={pathname ?? ""}>
                          <UiConfigContext.Provider
                            value={{
                              hostname,
                              uiConfig,
                            }}
                          >
                            {props.children}
                          </UiConfigContext.Provider>
                        </ErrorBoundary>
                      </AntdConfigProvider>
                    </DarkModeProvider>
                  )
                }

              </body>
            </AntdStyleRegistry>
          </StyledComponentsRegistry>
        </StyleProvider>
      </ScowParamsProvider>
    </Suspense>
  );
}
