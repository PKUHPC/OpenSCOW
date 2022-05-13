import { ChannelCredentials } from "@grpc/grpc-js";
import { runtimeConfig } from "src/utils/config";

type ClientConstructor<TClient> =
  new (address: string, credentials: ChannelCredentials) => TClient;

export function getJobServerClient<TClient>(
  cluster: string,
  ctor: ClientConstructor<TClient>,
): TClient {

  const url = runtimeConfig.JOB_SERVERS[cluster];

  if (!url) { throw new Error(`No clusterops is available for ${url}`);}

  return new ctor(
    url,
    ChannelCredentials.createInsecure(),
  );
}
