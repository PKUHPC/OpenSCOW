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

export class Migration20220505073454 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `job_billing_item` add column `amount` varchar(255) not null comment 'max-cpusAlloc-mem, max-gpu-cpusAlloc, gpu, cpusAlloc';");

    this.addSql("alter table `job_billing_item` rename index `job_billing_item_item_id_unique` to `job_price_item_item_id_unique`;");
    this.addSql("alter table `job_billing_item` rename index `job_billing_item_tenant_id_index` to `job_price_item_tenant_id_index`;");
    this.addSql("alter table `job_billing_item` drop constraint `job_billing_item_tenant_id_foreign`;");
    this.addSql("alter table `job_billing_item` add constraint `job_price_item_tenant_id_foreign` foreign key (`tenant_id`) references `tenant` (`id`) on update cascade on delete set null;");

    this.addSql("alter table `job_billing_item` rename to `job_price_item`;");
  }

  async down(): Promise<void> {
    this.addSql("alter table `job_price_item` drop column `amount`;");

    this.addSql("alter table `job_price_item` rename index `job_price_item_item_id_unique` to `job_billing_item_item_id_unique`;");
    this.addSql("alter table `job_price_item` rename index `job_price_item_tenant_id_index` to `job_billing_item_tenant_id_index`;");
    this.addSql("alter table `job_price_item` drop constraint `job_price_item_tenant_id_foreign`;");
    this.addSql("alter table `job_price_item` add constraint `job_billing_item_tenant_id_foreign` foreign key (`tenant_id`) references `tenant` (`id`) on update cascade on delete set null;");

    this.addSql("alter table `job_price_item` rename to `job_billing_item`;");

  }

}
