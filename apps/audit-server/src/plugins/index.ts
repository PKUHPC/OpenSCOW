/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

// Declares all plugins in this file
// In my yaarxiv project, there can be multiple interface augmentations separated in difference files
// But in this project, only one augmentation is resolved.
// Don't know why.

import type { MikroORM } from "@mikro-orm/core";
import type { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { ormPlugin } from "src/plugins/orm";

declare module "@ddadaal/tsgrpc-server" {
  interface Extensions {
    orm: MikroORM<MySqlDriver>;
  }

  interface Request {
    em: SqlEntityManager<MySqlDriver>;
  }
}

export const plugins = [
  ormPlugin,
];
