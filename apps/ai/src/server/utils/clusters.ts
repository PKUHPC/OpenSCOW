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

import { ChannelCredentials } from "@grpc/grpc-js";
import { AccountServiceClient } from "@scow/ai-scheduler-adapter-protos/build/protos/account";
import { AppServiceClient } from "@scow/ai-scheduler-adapter-protos/build/protos/app";
import { ConfigServiceClient } from "@scow/ai-scheduler-adapter-protos/build/protos/config";
import { JobServiceClient } from "@scow/ai-scheduler-adapter-protos/build/protos/job";
import { UserServiceClient } from "@scow/ai-scheduler-adapter-protos/build/protos/user";
import { VersionServiceClient } from "@scow/ai-scheduler-adapter-protos/build/protos/version";
import { clusters } from "src/server/config/clusters";

type ClientConstructor<TClient> =
  new (address: string, credentials: ChannelCredentials) => TClient;

export interface SchedulerAdapterClient {
  account: AccountServiceClient;
  user: UserServiceClient;
  job: JobServiceClient;
  config: ConfigServiceClient;
  version: VersionServiceClient;
  app: AppServiceClient;
}

export function getClient<TClient>(
  address: string, ctor: ClientConstructor<TClient>,
): TClient {
  return new ctor(
    address,
    ChannelCredentials.createInsecure(),
  );
}

export const getSchedulerAdapterClient = (address: string) => {
  return {
    account: getClient(address, AccountServiceClient),
    user: getClient(address, UserServiceClient),
    job: getClient(address, JobServiceClient),
    config: getClient(address, ConfigServiceClient),
    version: getClient(address, VersionServiceClient),
    app: getClient(address, AppServiceClient),
  } as SchedulerAdapterClient;
};

const adapterClientForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
  const client = getSchedulerAdapterClient(c.adapterUrl);
  prev[cluster] = client;
  return prev;
}, {} as Record<string, SchedulerAdapterClient>);

export const getAdapterClient = (cluster: string) => {
  return adapterClientForClusters[cluster];
};
