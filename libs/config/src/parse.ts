/**
 * Replace key1=value1,key2=value2 to { key1: value1, key1: value2 }.
 * Keys and values are trimmed. Empty values are preserved.
 *
 * @param input original input
 * @returns dict
 */
export function parseKeyValue(input: string): Record<string, string> {
  return input.split(",").reduce((prev, curr) => {
    const [key, value] = curr.split("=").map((x) => x.trim());
    if (key) {
      prev[key] = value ?? "";
    }
    return prev;
  }, {});
}

/**
 * Replace {a} to valueObj[a]. If valueObj[a] is undefined, replace with ""
 * @param str the original string
 * @param valueObj the object containing keys and values
 * @returns replaced string
 */
export function parsePlaceholder(str: string, valueObj: object) {
  return str.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, p1: string) => valueObj[p1] ?? "");
}

/**
 * Replace value1,value2 to [value1, value2]
 * @param str the original string
 * @param valueObj the array
 * @returns replaced string
 */
export function parseArray(str: string): string[] {
  if (str === "") {
    return [];
  }
  return str.split(",");
}
