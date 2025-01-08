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
import { createPromiseClient, Interceptor, PromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { getCommonConfig } from "@scow/config/build/common";
import { ClusterPartitionService } from "@scow/scow-resource-protos/build/partition_connect";
import { join } from "path";

export interface ScowResourceClient {
  resource: PromiseClient<typeof ClusterPartitionService>
}

const setAuthorization: Interceptor = (next) => async (req) => {
  const commonConfig = getCommonConfig();
  const token = commonConfig.scowApi?.auth?.token;

  if (token) {
    req.header.set("authorization", `Bearer ${token}`);
  }
  return next(req);
};

export function getClient<TService extends ServiceType>(
  scowResourceUrl: string, service: TService,
): PromiseClient<TService> {
  const transport = createConnectTransport({
    baseUrl: join(scowResourceUrl, "/api"),
    httpVersion: "1.1",
    interceptors: [setAuthorization],
  });

  return createPromiseClient(service, transport);
}

export const getScowResourceClient = (scowResourceUrl: string) => {
  return {
    resource: getClient(scowResourceUrl, ClusterPartitionService),
  } as ScowResourceClient;
};
