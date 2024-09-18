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

export class Migration20240126070152 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `image` add `status` enum('CREATED', 'CREATING', 'FAILURE') not null;");
    this.addSql("alter table `image` modify `path` varchar(255) null;");
    this.addSql("alter table `image` add unique `unique_name_tag_owner`(`name`, `tag`, `owner`);");
  }

  async down(): Promise<void> {
    this.addSql("alter table `image` modify `path` varchar(255) not null;");
    this.addSql("alter table `image` drop index `unique_name_tag_owner`;");
    this.addSql("alter table `image` drop `status`;");
  }

}
