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

export class Migration20230108135024 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `job_info` modify `account` varchar(255) not null comment '账户', modify `user` varchar(127) not null comment '用户名';");
  }

  async down(): Promise<void> {
    this.addSql("alter table `job_info` modify `account` varchar(20) not null comment '账户', modify `user` varchar(20) not null comment '用户名';");
  }

}
