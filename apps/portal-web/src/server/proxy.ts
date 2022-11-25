import httpProxy from "http-proxy";
import { runtimeConfig } from "src/utils/config";

export const proxy = httpProxy.createServer();

export function parseProxyTarget(url: string): string | Error {
  // skip base path
  const relativePath = runtimeConfig.BASE_PATH === "/"
    ? url
    : url.slice(runtimeConfig.BASE_PATH.length);

  const [_empty, _proxy, type, node, port, ...path] = relativePath.split("/");

  if (type === "relative") {
    return `http://${node}:${port}/${path.join("/")}`;
  } else if (type === "absolute") {
    return `http://${node}:${port}/${url}`;
  } else {
    return new Error("type is not absolute or relative");
  }
}
