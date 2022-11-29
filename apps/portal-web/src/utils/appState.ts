export function compareState(a: string, b: string): -1 | 0 | 1 {
  if (a === b || (a !== "ENDING" && b !== "ENDING")) { return 0; }
  if (a === "ENDING") { return -1; }
  return 1;
}
  