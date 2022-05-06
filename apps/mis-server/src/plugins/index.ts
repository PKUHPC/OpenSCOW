// Declares all plugins in this file
// In my yaarxiv project, there can be multiple interface augmentations separated in difference files
// But in this project, only one augmentation is resolved.
// Don't know why.

import type { MikroORM } from "@mikro-orm/core";
import type { SqlEntityManager } from "@mikro-orm/knex";
import type { MySqlDriver } from "@mikro-orm/mysql";
import { ClusterPlugin, clustersPlugin } from "src/plugins/clusters";
import { fetchPlugin } from "src/plugins/fetch";
import { ormPlugin } from "src/plugins/orm";
import { PricePlugin,pricePlugin } from "src/plugins/price";

declare module "@ddadaal/tsgrpc-server" {
  interface Extensions extends ClusterPlugin, PricePlugin {
    orm: MikroORM<MySqlDriver>;
  }

  interface Request {
    em: SqlEntityManager<MySqlDriver>;
  }
}

export const plugins = [
  ormPlugin,
  clustersPlugin,
  pricePlugin,
  fetchPlugin,
];
