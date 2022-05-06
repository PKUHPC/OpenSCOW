import { ChannelCredentials } from "@grpc/grpc-js";
import { VNC_SERVER_URL } from "src/utils/config";

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
