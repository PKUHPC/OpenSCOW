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

import { BASE_PATH } from "src/utils/processEnv";

import { ClientLayout } from "./client-layout";
import { ServerClientProvider } from "./server-client-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <ServerClientProvider basePath={BASE_PATH}>
        <ClientLayout basePath={BASE_PATH}>
          {children}
        </ClientLayout>
      </ServerClientProvider>
    </html>
  );
}
