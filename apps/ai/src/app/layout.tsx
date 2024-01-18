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

import "antd/dist/reset.css";

import { DEFAULT_PRIMARY_COLOR } from "@scow/config/build/ui";
import { DarkModeCookie } from "@scow/lib-web/build/layouts/darkMode";
import { cookies, headers } from "next/headers";
import { join } from "path";
import React from "react";
import { ClientLayout } from "src/app/clientLayout";
import { ServerClientProvider } from "src/app/trpcClient.server";
import { uiConfig } from "src/server/config/ui";
import { BASE_PATH } from "src/utils/processEnv";

export default function MyApp({ children }: { children: React.ReactNode }) {

  const cookie = cookies();

  const darkModeCookie = cookie.get("scow-dark");

  const dark = darkModeCookie ? JSON.parse(darkModeCookie.value) as DarkModeCookie : undefined;

  const host = headers().get("host");
  const hostname = host?.includes(":") ? host?.split(":")[0] : host;
  const color = (hostname && uiConfig.primaryColor?.hostnameMap?.[hostname])
    ?? uiConfig.primaryColor?.defaultColor ?? DEFAULT_PRIMARY_COLOR;

  return (
    <html>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link href={join(BASE_PATH, "manifest.json")} rel="manifest" id="manifest" />
      </head>
      <ServerClientProvider>
        <ClientLayout initialDark={dark} color={color}>
          {children}
        </ClientLayout>
      </ServerClientProvider>
    </html>
  );

}
