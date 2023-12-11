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

import { DarkModeCookie, DarkModeProvider, getDarkModeCookieValue } from "@scow/lib-web/build/layouts/darkMode";
import { cookies } from "next/headers";
import { ClientLayout } from "src/app/clientLayout";

export default function MyApp({ children }: { children: React.ReactNode }) {

  const cookie = cookies();

  const darkModeCookie = cookie.get("xscow-dark");

  const dark = darkModeCookie ? JSON.parse(darkModeCookie.value) as DarkModeCookie : undefined;

  return (
    <ClientLayout initialDark={dark}>
      {children}
    </ClientLayout>
  );


}
