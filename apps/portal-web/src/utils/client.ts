import { ChannelCredentials } from "@grpc/grpc-js";
import { runtimeConfig, VNC_SERVER_URL } from "src/utils/config";

type ClientConstructor<TClient> =
  new (address: string, credentials: ChannelCredentials) => TClient;

export function getVncClient<TClient>(
  ctor: ClientConstructor<TClient>,
): TClient {
  return new ctor(
    VNC_SERVER_URL,
    ChannelCredentials.createInsecure(),
  );
}

export function getClusteropsClient<TClient>(
  ctor: ClientConstructor<TClient>,
  cluster: string,
): TClient {

  const url = runtimeConfig.CLUSTEROPS_SERVERS[cluster];

  if (!url) { throw new Error(`No clusterops is available for ${url}`);}

  return new ctor(
    url,
    ChannelCredentials.createInsecure(),
  );
}
