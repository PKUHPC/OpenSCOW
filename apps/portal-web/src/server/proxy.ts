import httpProxy from "http-proxy";
import { normalize } from "path";
import { runtimeConfig } from "src/utils/config";

/**
 * Normalize url's pathname part
 * @param url url
 * @returns normalized url
 */
function normalizeUrl(url: string) {
  // strip querystring
  const qsIndex = url.indexOf("?");

  const pathname = url.slice(0, qsIndex === -1 ? undefined : qsIndex);
  const qs = qsIndex === -1 ? "" : url.slice(qsIndex);

  return normalize(pathname) + qs;
}


export const proxy = httpProxy.createServer();

export function parseProxyTarget(url: string): string | Error {

  const normalizedUrl = normalizeUrl(url);

  // skip base path
  const relativePath = runtimeConfig.BASE_PATH === "/"
    ? normalizedUrl
    : normalizedUrl.slice(runtimeConfig.BASE_PATH.length);

  const [_empty, _api, _proxy, type, node, port, ...path] = relativePath.split("/");

  if (type === "relative") {
    return `http://${node}:${port}/${path.join("/")}`;
  } else if (type === "absolute") {
    return `http://${node}:${port}/${url}`;
  } else {
    return new Error("type is not absolute or relative");
  }
}
