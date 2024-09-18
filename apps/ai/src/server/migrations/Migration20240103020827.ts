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

export class Migration20240103020827 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `modal_version` add `shared_status` varchar(255) not null;");
    this.addSql("alter table `modal_version` drop `is_shared`;");
  }

  async down(): Promise<void> {
    this.addSql("alter table `modal_version` add `is_shared` tinyint(1) not null;");
    this.addSql("alter table `modal_version` drop `shared_status`;");
  }

}
