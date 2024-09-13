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

import type { MikroORM } from "@mikro-orm/core";
import { MikroORM as ORM } from "@mikro-orm/core";
import type { MySqlDriver } from "@mikro-orm/mysql";
import { ormConfigs } from "src/server/config/mikro-orm";
import { DatabaseSeeder } from "src/server/seeders/DatabaseSeeder";

let orm: MikroORM<MySqlDriver>;
/**
 * Returns MikroORM instance.
 * Creates the new if one does not exists, then caches it.
 */
export async function getORM(): Promise<MikroORM<MySqlDriver>> {

  if (orm === undefined) {

    orm = await ORM.init(ormConfigs);

    const schemaGenerator = orm.getSchemaGenerator();
    await schemaGenerator.ensureDatabase();
    await orm.getMigrator().up();

    await orm.getSeeder().seed(DatabaseSeeder());
    console.log("orm.getMigrator().up()");
  }

  return orm;
}

export async function forkEntityManager() {
  const orm = await getORM();

  return orm.em.fork();
}
