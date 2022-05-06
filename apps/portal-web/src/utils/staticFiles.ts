export function basename(path: string) {
  const parts = path.split(/[\/\\]/);
  return parts[parts.length - 1];
}
