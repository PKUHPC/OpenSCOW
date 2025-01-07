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

import { Code, ConnectError, HandlerContext } from "@connectrpc/connect";
import { ChannelCredentials, ClientOptions } from "@grpc/grpc-js";
import { ScowApiConfigSchema } from "@scow/config/build/common";

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

export async function checkScowApiToken(context: HandlerContext, config: ScowApiConfigSchema | undefined):
Promise<null> {

  const authorization = context.requestHeader.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new ConnectError("UNAUTHORIZED", Code.Unauthenticated);
  }

  if (authorization !== `Bearer ${config?.auth?.token}`) {
    throw new ConnectError("UNAUTHORIZED", Code.Unauthenticated);
  }

  return null;

}
