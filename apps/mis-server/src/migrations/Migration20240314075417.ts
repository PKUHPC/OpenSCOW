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

/* eslint-disable @stylistic/max-len */

import { Migration } from "@mikro-orm/migrations";

export class Migration20240314075417 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `user_account` add `state` enum('NORMAL', 'BLOCKED_BY_ADMIN') not null default 'NORMAL' comment 'NORMAL, BLOCKED_BY_ADMIN';");

    this.addSql("alter table `user_account` change `status` `blocked_in_cluster` varchar(10) not null comment 'UNBLOCKED, BLOCKED';");

    this.addSql(`
      UPDATE user_account ua
      SET ua.state =
      CASE
        WHEN ua.job_charge_limit is NULL AND ua.blocked_in_cluster = 'BLOCKED'
        THEN 'BLOCKED_BY_ADMIN'
        WHEN ua.job_charge_limit is not NULL AND ua.used_job_charge < ua.job_charge_limit AND ua.blocked_in_cluster = 'BLOCKED'
        THEN 'BLOCKED_BY_ADMIN'
        ELSE 'NORMAL'
      END;
    `);
  }

  async down(): Promise<void> {
    this.addSql("alter table `user_account` drop column `state`;");

    this.addSql("alter table `user_account` change `blocked_in_cluster` `status` varchar(10) not null comment 'UNBLOCKED, BLOCKED';");
  }

}
