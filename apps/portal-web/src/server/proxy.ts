import httpProxy from "http-proxy";

export const proxy = httpProxy.createServer();

export function parseProxyTarget(url: string): string | Error {
  const parts = url.split("/");

  // find the end of base_path
  const proxyIndex = parts.indexOf("proxy");
  if (proxyIndex === -1) { return new Error("URL is malformed."); }

  const [_proxy, type, node, port, ...path] = parts.slice(proxyIndex);

  if (type === "relative") {
    return `http://${node}:${port}/${path.join("/")}`;
  } else if (type === "absolute") {
    return `http://${node}:${port}/${url}`;
  } else {
    return new Error("type is not absolute or relative");
  }
}
