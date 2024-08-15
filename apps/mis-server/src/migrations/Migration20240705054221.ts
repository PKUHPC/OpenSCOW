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

import { Migration } from "@mikro-orm/migrations";

export class Migration20240705054221 extends Migration {

  async up(): Promise<void> {
    // 修改已经存在的 `state` 列以增加新枚举值 'DELETED'
    this.addSql(
      "alter table `account` modify `state` enum('NORMAL', 'FROZEN', 'BLOCKED_BY_ADMIN', 'DELETED') " +
      "not null default 'NORMAL' comment 'NORMAL, FROZEN, BLOCKED_BY_ADMIN, DELETED';",
    );

    // 如果 `user` 表中还没有 `state` 列，添加它
    this.addSql(
      "alter table `user` add `state` enum('NORMAL', 'DELETED') " +
      "not null default 'NORMAL' comment 'NORMAL, DELETED';",
    );

    // 添加 `delete_remark` 列到 `user` 表
    this.addSql(
      "alter table `user` add `delete_remark` varchar(255) null;",
    );
  }

  async down(): Promise<void> {
    // 恢复 `account` 表中 `state` 列的原始枚举值
    this.addSql(
      "alter table `account` modify `state` enum('NORMAL', 'FROZEN', 'BLOCKED_BY_ADMIN') " +
      "not null default 'NORMAL' comment 'NORMAL, FROZEN, BLOCKED_BY_ADMIN';",
    );

    // 删除 `user` 表中的 `state` 列
    this.addSql(
      "alter table `user` drop column `state`;",
    );

    // 删除 `delete_remark` 列
    this.addSql(
      "alter table `user` drop column `delete_remark`;",
    );
  }

}
