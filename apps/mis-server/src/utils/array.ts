export function range(start = 1, end = 0, step = 1): number[] {
  const r = [] as number[];
  for (let i = start; i < end; i+=step) {
    r.push(i);
  }
  return r;
}
