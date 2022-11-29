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

import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Tenant } from "src/entities/Tenant";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";

export class DefaultTenantSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {

    // if default tenant exists, don't run
    if (await em.findOne(Tenant, { name: DEFAULT_TENANT_NAME })) {
      return;
    }

    const defaultTenant = new Tenant({ name: DEFAULT_TENANT_NAME });
    await em.persistAndFlush(defaultTenant);
  }

}
