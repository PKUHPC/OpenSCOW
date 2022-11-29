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
import { runtimeConfig } from "src/utils/config";

type ClientConstructor<TClient> =
  new (address: string, credentials: ChannelCredentials) => TClient;

export function getClient<TClient>(
  ctor: ClientConstructor<TClient>,
): TClient {
  return new ctor(
    runtimeConfig.SERVER_URL,
    ChannelCredentials.createInsecure(),
  );
}
