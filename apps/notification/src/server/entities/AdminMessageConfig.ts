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

import { EntitySchema } from "@mikro-orm/core";
import { NoticeType } from "src/models/notice-type";
import { DATETIME_TYPE } from "src/utils/orm";


export class AdminMessageConfig {
  id!: number;
  messageType: string;
  noticeType: NoticeType;
  enabled: boolean;
  canUserModify: boolean;
  // 每个通知类型的过期时间（秒）
  expiredAfterSeconds?: bigint;
  createdAt = new Date();
  updatedAt = new Date();

  constructor(init: {
    messageType: string;
    noticeType: NoticeType;
    enabled: boolean;
    canUserModify: boolean;
  }) {
    this.messageType = init.messageType;
    this.noticeType = init.noticeType;
    this.enabled = init.enabled;
    this.canUserModify = init.canUserModify;
  }
}

export const AdminMessageConfigSchema = new EntitySchema<AdminMessageConfig>({
  class: AdminMessageConfig,
  tableName: "admin_message_configs", // 数据库表名
  properties: {
    id: { type: Number, primary: true },
    noticeType: { enum: true, items: () => NoticeType },
    messageType: { type: "string", length: 255 },
    enabled: { type: "boolean" },
    canUserModify: { type: "boolean" },
    expiredAfterSeconds: { type: "bigint", nullable: true },
    createdAt: { type: "date", columnType: DATETIME_TYPE },
    updatedAt: { type: "date", columnType: DATETIME_TYPE, onUpdate: () => new Date() },
  },
  // 设置联合唯一约束
  indexes: [
    { properties: ["noticeType", "messageType"], options: { unique: true } },
  ],
});
