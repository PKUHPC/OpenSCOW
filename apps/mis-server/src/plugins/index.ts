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

// Declares all plugins in this file
// In my yaarxiv project, there can be multiple interface augmentations separated in difference files
// But in this project, only one augmentation is resolved.
// Don't know why.

import type { MikroORM } from "@mikro-orm/core";
import type { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { Capabilities } from "@scow/lib-auth";
import { ScowResourcePlugin, scowResourcePlugin } from "@scow/lib-scow-resource";
import { apiAuthPlugin } from "@scow/lib-server";
import { commonConfig } from "src/config/common";
import { authServicePlugin } from "src/plugins/authService";
import { ClearCachePlugin, clearCachePlugin } from "src/plugins/cachePlugin";
import { ClusterPlugin, clustersPlugin } from "src/plugins/clusters";
import { FetchPlugin, fetchPlugin } from "src/plugins/fetch";
import { ormPlugin } from "src/plugins/orm";
import { PricePlugin, pricePlugin } from "src/plugins/price";
import { SyncBlockStatusPlugin, syncBlockStatusPlugin } from "src/plugins/syncBlockStatus";

declare module "@ddadaal/tsgrpc-server" {
  interface Extensions extends ClusterPlugin, PricePlugin, FetchPlugin,
    SyncBlockStatusPlugin, ScowResourcePlugin, ClearCachePlugin {
    orm: MikroORM<MySqlDriver>;
    capabilities: Capabilities;
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
  authServicePlugin,
  syncBlockStatusPlugin,
  clearCachePlugin,
];

if (commonConfig.scowResource?.enabled) {
  // 当资源管理插件部署时，判断启动时是否执行 同步封锁状态
  if (commonConfig.scowResource.syncBlockStatusWhenStart) {
    plugins.push(syncBlockStatusPlugin);
  }
  plugins.push(scowResourcePlugin(commonConfig.scowResource));
} else {
  plugins.push(syncBlockStatusPlugin);
}

if (commonConfig.scowApi) {
  plugins.push(apiAuthPlugin(commonConfig.scowApi));
}