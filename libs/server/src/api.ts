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

import { ChannelCredentials, ClientOptions } from "@grpc/grpc-js";

export type ClientConstructor<TClient> =
new (address: string, credentials: ChannelCredentials, options?: ClientOptions) => TClient;

export const getClientFn = (
  serverUrl: string,
  scowApiAuthToken?: string,
) => <TClient>(
  ctor: ClientConstructor<TClient>,
): TClient => {
  return new ctor(
    serverUrl,
    ChannelCredentials.createInsecure(),
    scowApiAuthToken ?
      {
        callInvocationTransformer: (props) => {
          props.metadata.add("authorization", `Bearer ${scowApiAuthToken}`);
          return props;
        },
      } : undefined,
  );
};
