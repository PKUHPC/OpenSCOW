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

import { join, resolve } from "node:path";

import { EntityManager, MikroORM, Options } from "@mikro-orm/core";
import { defineConfig, MySqlDriver } from "@mikro-orm/mysql";
import { entities } from "src/server/entities";

const ROOT = resolve("db");

const aiConfig = {
  db: {
    host: "0.0.0.0",
    port: 3306,
    user: "root",
    dbName: "scow-ai",
    password: "mysqlrootpassword",
    debug: true,
  },
};

const distPath = "src/server";

export const ormConfigs = {
  host: aiConfig.db.host,
  port: aiConfig.db.port,
  user: aiConfig.db.user,
  dbName: aiConfig.db.dbName,
  password: aiConfig.db.password,
  type: "mysql",
  forceUndefined: true,
  runMigrations: true,
  migrations: {
    path: join(distPath, "migrations"),
    pattern: /^[\w-]+\d+\.(j|t)s$/,
  },
  entities,
  debug: aiConfig.db.debug,
  seeder: {
    path: join(distPath, "seenders"),
  },
} as Options<MySqlDriver>;

export const getConfig = async () => defineConfig(ormConfigs);
// export const getConfig = async () => defineConfig({
//   implicitTransactions: true,
//   dbName: process.env.MIKRO_ORM_DB_NAME || undefined,
//   host: process.env.MIKRO_ORM_HOST || undefined,
//   port: parseInt(process.env.MIKRO_ORM_PORT || "", 10) || undefined,
//   debug: process.env.NODE_ENV === "development",
//   migrations: {
//     path: join(ROOT, "migration"),
//   },
//   seeder: {
//     path: join(ROOT, "seed"),
//   },
//   entities,
// });
