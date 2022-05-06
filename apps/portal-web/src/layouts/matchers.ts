import type { NavItemProps } from "src/layouts/NavItemProps";

export type Matcher = (spec: string, path: string) => boolean;

export const exactMatch: Matcher = (spec, path) => {
  return path === spec;
};

export const startsWithMatch: Matcher = (spec, path) => {
  return path.startsWith(spec);
};

export const match = (item: NavItemProps, path: string) => {
  return (item.match ?? startsWithMatch)(item.path, path);
};
