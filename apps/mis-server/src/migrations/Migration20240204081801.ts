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

import { Migration } from "@mikro-orm/migrations";

export class Migration20240204081801 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `tenant` add `default_account_block_threshold` DECIMAL(19,4) not null default 0.0000;");

    this.addSql("alter table `account` add `block_threshold_amount` DECIMAL(19,4) null;");
  }

  async down(): Promise<void> {
    this.addSql("alter table `tenant` drop column `default_account_block_threshold`;");

    this.addSql("alter table `account` drop column `block_threshold_amount`;");
  }

}
