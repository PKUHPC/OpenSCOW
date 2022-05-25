import "nprogress/nprogress.css";
import "antd/dist/antd.variable.min.css";

import { failEvent, fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { message } from "antd";
import type { AppContext, AppProps } from "next/app";
import App from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { join } from "path";
import { useEffect, useRef } from "react";
import { createStore, StoreProvider, useStore } from "simstate";
import { MOCK_USER_INFO } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { getTokenFromCookie, setTokenCookie } from "src/auth/cookie";
import { RootLayout } from "src/layouts/RootLayout";
import { ValidateTokenSchema } from "src/pages/api/auth/validateToken";
import {
  User, UserStore,
} from "src/stores/UserStore";
import { GlobalStyle } from "src/styles/globalStyle";
import { MediaContextProvider } from "src/styles/media";
import { AntdConfigProvider } from "src/utils/AntdConfigProvider";
import { runtimeConfig } from "src/utils/config";
import { getHostname } from "src/utils/host";
import { isServer } from "src/utils/isServer";
import useConstant from "src/utils/useConstant";

const FailEventHandler: React.FC = () => {
  const userStore = useStore(UserStore);

  // 登出过程需要调用的几个方法（logout, useState等）都是immutable的
  // 所以不需要每次userStore变化时来重新注册handler
  useEffect(() => {
    failEvent.register((e) => {
      if (e.status === 401) {
        userStore.logout();
      } else {
        message.error(`服务器出错啦！(${e.status}, ${e.data?.code}))`);
      }
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
}

type Props = AppProps & { extra: ExtraProps };

function MyApp({ Component, pageProps, extra }: Props) {

  // remembers extra props from first load
  const { current: { userInfo, primaryColor, footerText } } = useRef(extra);

  const userStore = useConstant(() => {
    const store = createStore(UserStore, userInfo);
    return store;
  });

  // Use the layout defined at the page level, if available
  return (
    <>
      <Head>
        <meta name="format-detection" content="telephone=no"/>
        <link href="/manifest.json" rel="manifest" id="manifest" />
        <link rel="icon" type="image/x-icon" href="/api/icon?type=favicon"></link>
      </Head>
      <GlobalStyle />
      <StoreProvider stores={[userStore]}>
        <AntdConfigProvider color={primaryColor}>
          <FailEventHandler />
          <TopProgressBar />
          <MediaContextProvider>
            <RootLayout footerText={footerText}>
              <Component {...pageProps} />
            </RootLayout>
          </MediaContextProvider>
        </AntdConfigProvider>
      </StoreProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const extra: ExtraProps = {
    userInfo: undefined,
    footerText: "",
    primaryColor: "",
  };

  // This is called on server on first load, and on client on every page transition
  // But we don't need to fetch token info on every page transition
  // so only execute on server
  // Also, validateToken relies on redis, which is not available in client bundle
  if (isServer()) {

    if (USE_MOCK) {
      const token = "123";
      extra.userInfo = {
        ...MOCK_USER_INFO,
        token,
      };
      setTokenCookie(appContext.ctx, token);
    } else {
      const token = getTokenFromCookie(appContext.ctx);


      if (token) {
        // Why not directly call validateToken but create an api?
        // Because this method will (in next.js's perspective) be called both in client and server,
        // so next.js will import validateToken into the client bundle
        // validateToken depends on ioredis, which cannot be brought into frontend.
        // dynamic import also doesn't work.

        // Why not use api object directly?
        // fetch in server (node-fetch per se) only supports absolute url
        // but next-typed-api-routes's object has only pathname
        const result = await fromApi<ValidateTokenSchema>(
          "GET",
          join(
            `http://localhost:${process.env.PORT ?? 3000}`,
            process.env.NEXT_PUBLIC_BASE_PATH || "/",
            "/api/auth/validateToken",
          ),
        )({ query: { token } }).catch(() => undefined);

        if (result) {
          extra.userInfo = {
            ...result,
            token: token,
          };
        }
      }
    }

    const hostname = getHostname(appContext.ctx.req);
    extra.primaryColor = (hostname && runtimeConfig.PRIMARY_COLORS[hostname]) ?? runtimeConfig.DEFAULT_PRIMARY_COLOR;
    extra.footerText = (hostname && runtimeConfig.FOOTER_TEXTS[hostname]) ?? runtimeConfig.DEFAULT_FOOTER_TEXT;
  }

  const appProps = await App.getInitialProps(appContext);


  return { ...appProps, extra } as Props;
};

export default MyApp;
