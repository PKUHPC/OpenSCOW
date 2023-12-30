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

import { usePathname } from "next/navigation";
import { ClientProvider } from "src/app/trpcClient";
import { ErrorBoundary } from "src/components/ErrorBoundary";
import { TopProgressBar } from "src/components/TopProgressBar";
import { AntdConfigProvider } from "src/layouts/AntdConfigProvider";
import { DarkModeCookie, DarkModeProvider } from "src/layouts/darkMode";
import { RootErrorContent } from "src/layouts/error/RootErrorContent";
import { GlobalStyle } from "src/layouts/globalStyle";
import { AntdStyleRegistry } from "src/layouts/styleRegistry/AntdRegistry.jsx";
import StyledComponentsRegistry from "src/layouts/styleRegistry/StyledComponentsRegistry.jsx";
import { BASE_PATH } from "src/utils/processEnv";

export function ClientLayout(props: { children: React.ReactNode, initialDark?: DarkModeCookie }) {
  const pathname = usePathname();

  return (
    <html>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link href="/manifest.json" rel="manifest" id="manifest" />
        <script
          id="__CONFIG__"
          dangerouslySetInnerHTML={{
            __html: `
              window.__CONFIG__ = ${
    JSON.stringify({
      BASE_PATH: BASE_PATH === "/" ? "" : BASE_PATH,
    })};
            `,
          }}
        />
      </head>
      <StyledComponentsRegistry>
        <AntdStyleRegistry>
          <GlobalStyle />
          <body>
            <ClientProvider>
              <DarkModeProvider initial={props.initialDark}>
                <AntdConfigProvider>
                  <TopProgressBar />
                  <ErrorBoundary Component={RootErrorContent} pathname={pathname ?? ""}>
                    {props.children}
                  </ErrorBoundary>
                </AntdConfigProvider>
              </DarkModeProvider>
            </ClientProvider>
          </body>
        </AntdStyleRegistry>
      </StyledComponentsRegistry>
    </html>
  );
}
