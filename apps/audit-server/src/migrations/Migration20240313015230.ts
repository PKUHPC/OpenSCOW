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

export class Migration20240313015230 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `operation_log` add `custom_event_type` varchar(255) null;");
    this.addSql("alter table `operation_log` modify `operation_time` DATETIME(6) not null default current_timestamp(6), modify `operation_result` enum('UNKNOWN', 'SUCCESS', 'FAIL') not null comment 'UNKNOWN, SUCCESS, FAIL';");
    this.addSql("alter table `operation_log` add index `custom_event`(`custom_event_type`);");
  }

  async down(): Promise<void> {
    this.addSql("alter table `operation_log` drop index `custom_event`;");
    this.addSql("alter table `operation_log` drop column `custom_event_type`;");

    this.addSql("alter table `operation_log` modify `operation_time` DATETIME(6) not null default current_timestamp(0), modify `operation_result` enum('UNKNOWN', 'SUCCESS', 'FAIL') not null comment 'UNKNOWN, SUCCESS, FAIL';");
  }

}
