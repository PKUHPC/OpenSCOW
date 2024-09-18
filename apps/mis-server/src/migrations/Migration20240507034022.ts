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

export class Migration20240507034022 extends Migration {

  async up(): Promise<void> {
    this.addSql("create table `cluster` (`id` int unsigned not null auto_increment primary key, `cluster_id` varchar(255) not null, `activation_status` enum('ACTIVATED', 'DEACTIVATED') not null default 'ACTIVATED' comment 'ACTIVATED, DEACTIVATED', `last_activation_operation` json null, `create_time` DATETIME(6) null, `update_time` DATETIME(6) null) default character set utf8mb4 engine = InnoDB;");
    this.addSql("alter table `cluster` add unique `cluster_cluster_id_unique`(`cluster_id`);");
  }

  async down(): Promise<void> {
    this.addSql("drop table if exists `cluster`;");
  }

}
