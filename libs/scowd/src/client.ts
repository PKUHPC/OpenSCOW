/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import type { ServiceType } from "@bufbuild/protobuf";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { AppService } from "@scow/scowd-protos/build/application/app_connect";
import { DesktopService } from "@scow/scowd-protos/build/application/desktop_connect";
import { FileService } from "@scow/scowd-protos/build/storage/file_connect";

import { SslConfig } from "./ssl";

export interface ScowdClient {
  file: PromiseClient<typeof FileService>;
  desktop: PromiseClient<typeof DesktopService>;
  app: PromiseClient<typeof AppService>;
}

export function getClient<TService extends ServiceType>(
  scowdUrl: string, service: TService, certificates?: SslConfig,
): PromiseClient<TService> {
  const transport = createConnectTransport({
    baseUrl: scowdUrl,
    httpVersion: "2",
    nodeOptions: {
      ...certificates,
    },
  });
  return createPromiseClient(service, transport);
}

export const getScowdClient = (scowdUrl: string, certificates?: SslConfig) => {
  return {
    file: getClient(scowdUrl, FileService, certificates),
    desktop: getClient(scowdUrl, DesktopService, certificates),
    app: getClient(scowdUrl, AppService, certificates),
  } as ScowdClient;
};
