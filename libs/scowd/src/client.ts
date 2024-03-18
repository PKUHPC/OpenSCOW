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

import type { ServiceType } from "@bufbuild/protobuf";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
// import { ChannelCredentials } from "@grpc/grpc-js";
import { DesktopService } from "@scow/scowd-protos/build/application/desktop_connect";
import { FileService } from "@scow/scowd-protos/build/storage/file_connect";


export interface ScowdClient {
  file: PromiseClient<typeof FileService>;
}

export function getClient<TService extends ServiceType>(
  address: string, service: TService,
): PromiseClient<TService> {
  const transport = createConnectTransport({
    baseUrl: address,
    httpVersion: "2",
    // nodeOptions:
  });
  return createPromiseClient(service, transport);
}

export const getScowdClient = (address: string) => {
  return <ScowdClient>{
    file: getClient(address, FileService),
    desktop: getClient(address, DesktopService),
  };
};
