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

/* eslint-disable @stylistic/max-len */

import { Migration } from "@mikro-orm/migrations";

export class Migration20220209032454 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `job_price_change` add `new_tenant_price` DECIMAL(19,4) null, add `new_account_price` DECIMAL(19,4) null;");
    this.addSql("update `job_price_change` set `new_tenant_price` = `new_price`, `new_account_price` = `new_price`;");
    this.addSql("alter table `job_price_change` drop `new_price`;");
  }

  async down(): Promise<void> {
    this.addSql("alter table `job_price_change` add `new_price` DECIMAL(19,4) not null;");
    this.addSql("update `job_price_change` set `new_price` = `new_tenant_price`;");
    this.addSql("alter table `job_price_change` drop `new_tenant_price`, drop `new_account_price`;");
  }

}
