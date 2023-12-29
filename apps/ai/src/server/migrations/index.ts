/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Migration20231221073202 } from "src/server/migrations/Migration20231221073202";
import { Migration20231221083225 } from "src/server/migrations/Migration20231221083225";
import { Migration20231223072956 } from "./Migration20231223072956";
import { Migration20231225062131 } from "./Migration20231225062131";
import { Migration20231225081243 } from "./Migration20231225081243";
import { Migration20231226031805 } from "./Migration20231226031805";
import { Migration20231229033421 } from "./Migration20231229033421";

export const migrations =
[
  Migration20231221073202,
  Migration20231221083225,
  Migration20231223072956,
  Migration20231225062131,
  Migration20231225081243,
  Migration20231226031805,
  Migration20231229033421
].map((x) => ({ name: x.name, class: x }));
