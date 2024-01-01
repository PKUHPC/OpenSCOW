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

import "reflect-metadata";

import { join } from "node:path";

import { ReflectMetadataProvider } from "@mikro-orm/core";
import { defineConfig } from "@mikro-orm/mysql";
import { entities } from "src/server/entities";
import { migrations } from "src/server/migrations";

import { aiConfig } from "./ai";

const distPath = "src/server";

export const ormConfigs = defineConfig({
  host: aiConfig.db.host,
  port: aiConfig.db.port,
  user: aiConfig.db.user,
  dbName: aiConfig.db.dbName,
  password: aiConfig.db.password,
  type: "mysql",
  forceUndefined: true,
  migrations: {
    pathTs: join(distPath, "migrations"),
    migrationsList: migrations,
  },
  metadataProvider: ReflectMetadataProvider,
  entities,
  debug: aiConfig.db.debug,
  seeder: {
    path: join(distPath, "seenders"),
  },
});

