import { Migration20240826031724 } from "./Migration20240826031724";
import { Migration20241016020849 } from "./Migration20241016020849";
import { Migration20241126014409 } from "./Migration20241126014409";
import { Migration20241216025519 } from "./Migration20241216025519";

export const migrations =
[
  Migration20240826031724,
  Migration20241016020849,
  Migration20241126014409,
  Migration20241216025519,
].map((x) => ({ name: x.name, class: x }));
