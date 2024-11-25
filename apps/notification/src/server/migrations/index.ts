import { Migration20240826031724 } from "./Migration20240826031724";
import { Migration20241016020849 } from "./Migration20241016020849";
import { Migration20241120012334 } from "./Migration20241120012334";
import { Migration20241125084118 } from "./Migration20241125084118";

export const migrations =
[
  Migration20240826031724,
  Migration20241016020849,
  Migration20241120012334,
  Migration20241125084118,
].map((x) => ({ name: x.name, class: x }));
