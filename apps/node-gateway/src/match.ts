interface Rule {
  prefix: string;
}

/**
 * Longest match
 * @param url the url to match
 * @param rules rules
 * @returns the matched rule, or undefined if no
 */
export function longestMatch<T extends Rule>(url: string, rules: T[]): T | undefined {
  let longest: T | undefined = undefined;
  for (const rule of rules) {
    if (url.startsWith(rule.prefix) && (!longest || rule.prefix.length > longest.prefix.length)) {
      longest = rule;
    }
  }
  return longest;
}

export function stripPrefix(url: string, prefix: string) {
  return prefix === "/" ? url : url.slice(prefix.length);
}
