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
import { TransportProvider } from "@connectrpc/connect-query";
import { createConnectTransport } from "@connectrpc/connect-web";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { join } from "path";
import { BASE_PATH } from "src/utils/processEnv";

import { ClientLayout } from "./client-layout";

const finalTransport = createConnectTransport({
  baseUrl: join(BASE_PATH + "api"),
});

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <TransportProvider transport={finalTransport}>
        <QueryClientProvider client={queryClient}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </QueryClientProvider>
      </TransportProvider>
    </html>
  );
}
