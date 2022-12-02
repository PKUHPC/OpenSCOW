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

import "nprogress/nprogress.css";
import "antd/dist/reset.css";

import { failEvent, fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import type { AppContext, AppProps } from "next/app";
import NextApp from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { join } from "path";
import { useEffect, useRef } from "react";
import { createStore, StoreProvider, useStore } from "simstate";
import { USE_MOCK } from "src/apis/useMock";
import { getTokenFromCookie } from "src/auth/cookie";
import { App } from "src/generated/portal/app";
import { AntdConfigProvider } from "src/layouts/AntdConfigProvider";
import { BaseLayout } from "src/layouts/base/BaseLayout";
import { DarkModeProvider } from "src/layouts/darkMode";
import { useMessage } from "src/layouts/prompts";
import { ListAvailableAppsSchema } from "src/pages/api/app/listAvailableApps";
import { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import { AppsStore } from "src/stores/AppsStore";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import {
  User, UserStore,
} from "src/stores/UserStore";
import { GlobalStyle } from "src/styles/globalStyle";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { getHostname } from "src/utils/host";
import { isServer } from "src/utils/isServer";
import useConstant from "src/utils/useConstant";


const FailEventHandler: React.FC = () => {
  const message = useMessage();
  const userStore = useStore(UserStore);

  // 登出过程需要调用的几个方法（logout, useState等）都是immutable的
  // 所以不需要每次userStore变化时来重新注册handler
  useEffect(() => {
    failEvent.register((e) => {
      if (e.status === 401) {
        userStore.logout();
        return;
      }

      if (e.data?.code === "SSH_ERROR") {
        message.error("以用户身份连接到集群失败");
        return;
      }

      message.error(`服务器出错啦！(${e.status}, ${e.data?.code}))`);
    });
  }, []);

  return <></>;
};


const TopProgressBar = dynamic(
  () => {
    return import("src/components/TopProgressBar");
  },
  { ssr: false },
);

interface ExtraProps {
  userInfo: User | undefined;
  primaryColor: string;
  footerText: string;
  apps: App[];
}

type Props = AppProps & { extra: ExtraProps };

function MyApp({ Component, pageProps, extra }: Props) {

  // remembers extra props from first load
  const { current: { userInfo, primaryColor, footerText } } = useRef(extra);

  const userStore = useConstant(() => {
    const store = createStore(UserStore, userInfo);
    return store;
  });

  const defaultClusterStore = useConstant(() => {
    return createStore(DefaultClusterStore, publicConfig.CLUSTERS[0]);
  });

  const appsStore = useConstant(() => createStore(AppsStore, extra.apps));

  // Use the layout defined at the page level, if available
  return (
    <>
      <Head>
        <meta name="format-detection" content="telephone=no" />
        <link href="/manifest.json" rel="manifest" id="manifest" />
        <link
          rel="icon"
          type="image/x-icon"
          href={join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/icon?type=favicon")}
        ></link>
      </Head>
      <StoreProvider stores={[userStore, defaultClusterStore, appsStore]}>
        <DarkModeProvider>
          <AntdConfigProvider color={primaryColor}>
            <GlobalStyle />
            <FailEventHandler />
            <TopProgressBar />
            <BaseLayout footerText={footerText}>
              <Component {...pageProps} />
            </BaseLayout>
          </AntdConfigProvider>
        </DarkModeProvider>
      </StoreProvider>

    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const extra: ExtraProps = {
    userInfo: undefined,
    footerText: "",
    primaryColor: "",
    apps: [],
  };

  // This is called on server on first load, and on client on every page transition
  // But we don't need to fetch token info on every page transition
  // so only execute on server
  // Also, validateToken relies on redis, which is not available in client bundle
  if (isServer()) {
    const token = USE_MOCK ? "123" : getTokenFromCookie(appContext.ctx);
    if (token) {
      // Why not directly call validateToken but create an api?
      // Because this method will (in next.js's perspective) be called both in client and server,
      // so next.js will import validateToken into the client bundle
      // validateToken depends on ioredis, which cannot be brought into frontend.
      // dynamic import also doesn't work.

      // Why not use api object directly?
      // fetch in server (node-fetch per se) only supports absolute url
      // but next-typed-api-routes's object has only pathname

      const basePrefix = join(
        `http://localhost:${process.env.PORT ?? 3000}`,
        process.env.NEXT_PUBLIC_BASE_PATH || "/",
      );

      const userInfo = await fromApi<ValidateTokenSchema>(
        "GET",
        join(basePrefix, "/api/auth/validateToken"),
      )({ query: { token } }).catch(() => undefined);

      if (userInfo) {
        extra.userInfo = {
          ...userInfo,
          token: token,
        };

        const apps = USE_MOCK
          ? [{ id: "vscode", name: "VSCode" }, { id: "emacs", name: "Emacs" }]
          : await fromApi<ListAvailableAppsSchema>(
            "GET",
            join(basePrefix, "/api/app/listAvailableApps"),
          )({ query: { token } }).then((x) => x.apps);

        extra.apps = apps;
      }
    }

    const hostname = getHostname(appContext.ctx.req);

    extra.primaryColor = (hostname && runtimeConfig.UI_CONFIG?.primaryColor?.hostnameMap?.[hostname])
      ?? runtimeConfig.UI_CONFIG?.primaryColor?.defaultColor ?? runtimeConfig.DEFAULT_PRIMARY_COLOR;
    extra.footerText = (hostname && runtimeConfig.UI_CONFIG?.footer?.hostnameTextMap?.[hostname])
      ?? runtimeConfig.UI_CONFIG?.footer?.defaultText ?? "";
  }

  const appProps = await NextApp.getInitialProps(appContext);

  // getAvailable

  return { ...appProps, extra } as Props;
};

export default MyApp;
