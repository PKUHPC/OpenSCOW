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

import { EntityManager, MikroORM } from "@mikro-orm/mysql";
import { ormConfigs } from "src/server/config/db";

let orm: MikroORM;
/**
 * Returns MikroORM instance.
 * Creates the new if one does not exists, then caches it.
 */
export async function getORM(): Promise<MikroORM> {

  if (orm === undefined) {

    orm = await MikroORM.init(ormConfigs);

    const schemaGenerator = orm.getSchemaGenerator();
    await schemaGenerator.ensureDatabase();
    await orm.getMigrator().up();
    console.log("orm.getMigrator().up()");
  }

  return orm;
}

export async function forkEntityManager(): Promise<EntityManager> {
  const orm = await getORM();

  return orm.em.fork();
}

