/** Parse {key} in str to valueObj[key] */
export function parseCommentPlaceholder(str: string, valueObj: object) {
  return str.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, p1: string) => valueObj[p1] ?? "");
}
