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

import "nprogress/nprogress.css";
import "antd/dist/reset.css";

import { failEvent } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { AntdConfigProvider } from "@scow/lib-web/build/layouts/AntdConfigProvider";
import { DarkModeCookie, DarkModeProvider } from "@scow/lib-web/build/layouts/darkMode";
import { GlobalStyle } from "@scow/lib-web/build/layouts/globalStyle";
import { AntdStyleRegistry } from "@scow/lib-web/build/layouts/styleRegistry/AntdRegistry";
import StyledComponentsRegistry from "@scow/lib-web/build/layouts/styleRegistry/StyledComponentsRegistry";
import { useConstant } from "@scow/lib-web/build/utils/hooks";
import { App as AntdApp } from "antd";
import dynamic from "next/dynamic";
import { PropsWithChildren, useEffect } from "react";
import { createStore, StoreProvider, useStore } from "simstate";
import { BaseLayout } from "src/layouts/BaseLayout";
import { FloatButtons } from "src/layouts/FloatButtons";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { User, UserStore } from "src/stores/UserStore";
import { Cluster } from "src/utils/config";

const FailEventHandler: React.FC<{ clusters: Props["clusters"] }> = ({ clusters }) => {
  const { message, modal } = AntdApp.useApp();
  const userStore = useStore(UserStore);

  // 登出过程需要调用的几个方法（logout, useState等）都是immutable的
  // 所以不需要每次userStore变化时来重新注册handler
  useEffect(() => {
    failEvent.register((e) => {
      if (e.status === 401) {
        userStore.logout();
        return;
      }

      if (e.data?.code === "CLUSTEROPS_ERROR") {
        modal.error({
          title: "操作失败",
          content: `多集群操作出现错误，部分集群未同步修改(${
            e.data.details?.split(",").map((x) => clusters[x].name)
          }), 请联系管理员!`,
        });
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

type Props = PropsWithChildren<{
  userInfo: User | undefined;
  primaryColor: string;
  footerText: string;
  darkModeCookieValue: DarkModeCookie | undefined;
  clusters: { [clusterId: string]: Cluster };
}>;

export function ClientLayout({
  darkModeCookieValue, footerText, primaryColor, userInfo, clusters,
  children,
}: Props) {

  const userStore = useConstant(() => {
    const store = createStore(UserStore, userInfo);
    return store;
  });

  const defaultClusterStore = useConstant(() => {
    const store = createStore(DefaultClusterStore, clusters[0]);
    return store;
  });

  // Use the layout defined at the page level, if available
  return (
    <StoreProvider stores={[userStore, defaultClusterStore]}>
      <StyledComponentsRegistry>
        <AntdStyleRegistry>
          <DarkModeProvider initial={darkModeCookieValue}>
            <AntdConfigProvider color={primaryColor}>
              <FloatButtons />
              <GlobalStyle />
              <FailEventHandler clusters={clusters} />
              <TopProgressBar />
              <BaseLayout footerText={footerText}>
                {children}
              </BaseLayout>
            </AntdConfigProvider>
          </DarkModeProvider>
        </AntdStyleRegistry>
      </StyledComponentsRegistry>
    </StoreProvider>
  );
}

