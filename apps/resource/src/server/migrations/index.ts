import { Migration20240827164325 } from "./Migration20240827164325";

export const migrations =
  [
    Migration20240827164325,
  ].map((x) => ({ name: x.name, class: x }));
