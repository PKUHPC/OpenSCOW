import { ChannelCredentials } from "@grpc/grpc-js";
import { runtimeConfig } from "src/utils/config";

type ClientConstructor<TClient> =
  new (address: string, credentials: ChannelCredentials) => TClient;

export function getJobServerClient<TClient>(
  ctor: ClientConstructor<TClient>,
): TClient {

  return new ctor(
    runtimeConfig.JOB_SERVER,
    ChannelCredentials.createInsecure(),
  );
}
