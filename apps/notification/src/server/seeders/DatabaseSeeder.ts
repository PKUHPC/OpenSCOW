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

import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { AdminMessageConfigSeeder } from "src/server/seeders/AdminMessageConfigSeeder";

export const DatabaseSeeder = () => class DatabaseSeeder extends Seeder {
  async run(em: EntityManager<IDatabaseDriver<Connection>>): Promise<void> {
    await this.call(em, [
      AdminMessageConfigSeeder(),
    ]);
  }

};
