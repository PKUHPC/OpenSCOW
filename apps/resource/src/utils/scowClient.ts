import { ChannelCredentials, ClientOptions } from "@grpc/grpc-js";
import { config } from "src/server/config/env";
import { scowConfig } from "src/server/config/scow";

export type ClientConstructor<TClient> =
  new (address: string, credentials: ChannelCredentials, options?: ClientOptions) => TClient;

export const getClientFn = () => <TClient>(
  ctor: ClientConstructor<TClient>,
): TClient => {
  return new ctor(
    config.MIS_SERVER_URL || scowConfig.misServerUrl,
    ChannelCredentials.createInsecure(),
  );
};

export const getScowClient = getClientFn();
