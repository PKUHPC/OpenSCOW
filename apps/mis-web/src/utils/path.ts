export function pathEquals(path1: string, path2: string): boolean {
  if (path1.endsWith("/")) { path1 = path1.substr(0, path1.length - 1); }
  if (path2.endsWith("/")) { path2 = path2.substr(0, path2.length - 1); }

  return path1 === path2;
}

