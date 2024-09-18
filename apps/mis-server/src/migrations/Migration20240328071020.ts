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

export class Migration20240328071020 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `account` modify `state` enum('NORMAL', 'FROZEN', 'BLOCKED_BY_ADMIN') not null default 'NORMAL' comment 'NORMAL, FROZEN, BLOCKED_BY_ADMIN';");
  }

  async down(): Promise<void> {
    this.addSql("alter table `account` modify `state` enum('FROZEN', 'BLOCKED_BY_ADMIN', 'NORMAL') not null comment 'FROZEN, BLOCKED_BY_ADMIN, NORMAL';");
  }

}
