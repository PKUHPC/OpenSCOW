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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { DEFAULT_PRIMARY_COLOR } from "@scow/config/build/ui";
import { getUser as authGetUser, validateToken as authValidateToken } from "@scow/lib-auth";
import { DarkModeCookie } from "@scow/lib-web/build/layouts/darkMode";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import { join } from "path";
import { cache } from "react";
import { MOCK_USER_INFO } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { getClient } from "src/app/client";
import { ClientLayout } from "src/app/ClientLayout";
import { AUTH_INTERNAL_URL, BASE_PATH, clustersConfig, uiConfig } from "src/app/config";
import { USER_TOKEN_COOKIE_KEY } from "src/auth/cookie";
import { User } from "src/stores/UserStore";

export async function generateMetadata(): Promise<Metadata> {

  return {
    formatDetection: { telephone: false },
    manifest: join(BASE_PATH, "/manifest.json"),
    icons: join(BASE_PATH, "/api/icon?type=\"favicon\""),
  };
}


export async function validateToken(token: string): Promise<User | undefined> {

  if (USE_MOCK) {
    return { ...MOCK_USER_INFO, token };
  }

  const resp = await authValidateToken(AUTH_INTERNAL_URL, token).catch(() => undefined);

  if (!resp) {
    return undefined;
  }

  const authUserInfo = await authGetUser(AUTH_INTERNAL_URL, { identityId: resp.identityId })
    .catch(() => undefined);

  const client = getClient(UserServiceClient);

  const userInfo = await asyncClientCall(client, "getUserInfo", {
    userId: resp.identityId,
  });

  return {
    accountAffiliations: userInfo.affiliations,
    identityId: resp.identityId,
    name: authUserInfo?.name,
    platformRoles: userInfo.platformRoles,
    tenant: userInfo.tenantName,
    tenantRoles: userInfo.tenantRoles,
    token,
  };
}

const getUser = cache(async () => {
  const token = cookies().get(USER_TOKEN_COOKIE_KEY)?.value;
  return token ? validateToken(token) : undefined;
});

const clusters = Object.entries(clustersConfig).reduce((prev, [clusterId, config]) => {
  prev[clusterId] = config.displayName;
  return prev;
}, {});

export default async function({ children }: { children: React.ReactNode }) {

  const cookie = cookies();

  const darkModeCookie = cookie.get("scow-dark");

  const dark = darkModeCookie ? JSON.parse(darkModeCookie.value) as DarkModeCookie : undefined;

  const hostname = headers().get("host");

  const user = await getUser();

  const primaryColor = (hostname && uiConfig.primaryColor?.hostnameMap?.[hostname])
  ?? uiConfig.primaryColor?.defaultColor ?? DEFAULT_PRIMARY_COLOR;
  const footerText = (hostname && uiConfig?.footer?.hostnameTextMap?.[hostname])
  ?? uiConfig.footer?.defaultText ?? "";

  return (
    <html lang="cn">
      <Script
        id="__CONFIG__"
        dangerouslySetInnerHTML={{ __html: `
        window.__CONFIG__ = ${
    JSON.stringify({
      BASE_PATH: BASE_PATH === "/" ? "" : BASE_PATH,
    })};
      ` }}
      ></Script>
      <ClientLayout
        darkModeCookieValue={dark}
        userInfo={user}
        primaryColor={primaryColor}
        footerText={footerText}
        clusters={clusters}
      >
        {children}
      </ClientLayout>
    </html>
  );
}
