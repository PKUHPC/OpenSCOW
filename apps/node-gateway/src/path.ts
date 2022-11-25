import { normalize } from "path";

/**
 * Normalize url's pathname part
 * @param url url
 * @returns normalized url
 */
export function normalizeUrl(url: string) {
  // strip querystring
  const qsIndex = url.indexOf("?");

  const pathname = url.slice(0, qsIndex === -1 ? undefined : qsIndex);
  const qs = qsIndex === -1 ? "" : url.slice(qsIndex);

  return normalize(pathname) + qs;
}
