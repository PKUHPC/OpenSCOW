import { IncomingMessage } from "http";

export function getHostname(req: IncomingMessage | undefined) {
  return req?.headers?.host;
}
