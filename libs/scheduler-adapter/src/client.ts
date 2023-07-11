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

import { ChannelCredentials } from "@grpc/grpc-js";
import { AccountServiceClient } from "@scow/scheduler-adapter-protos/build/protos/account";
import { ConfigServiceClient } from "@scow/scheduler-adapter-protos/build/protos/config";
import { JobServiceClient } from "@scow/scheduler-adapter-protos/build/protos/job";
import { UserServiceClient } from "@scow/scheduler-adapter-protos/build/protos/user";

type ClientConstructor<TClient> =
  new (address: string, credentials: ChannelCredentials) => TClient;

export interface SchedulerAdapterClient {
  account: AccountServiceClient;
  user: UserServiceClient;
  job: JobServiceClient;
  config: ConfigServiceClient;
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
  return <SchedulerAdapterClient>{
    account: getClient(address, AccountServiceClient),
    user: getClient(address, UserServiceClient),
    job: getClient(address, JobServiceClient),
    config: getClient(address, ConfigServiceClient),
  };
};
