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

export class UserSubscription {
  id!: number;
  userId: string;
  messageType: string;
  noticeType: NoticeType;
  isSubscribed: boolean;
  createdAt = new Date();
  updatedAt = new Date();

  constructor(init: {
    userId: string;
    messageType: string;
    noticeType: NoticeType;
    isSubscribed: boolean;
  }) {
    this.userId = init.userId;
    this.messageType = init.messageType;
    this.noticeType = init.noticeType;
    this.isSubscribed = init.isSubscribed;
  }
}

export const UserSubscriptionSchema = new EntitySchema<UserSubscription>({
  class: UserSubscription,
  tableName: "user_subscriptions", // 数据库表名
  properties: {
    id: { type: "number", primary: true },
    userId: { type: "string", length: 255 },
    noticeType: { enum: true, items: () => NoticeType },
    messageType: { type: "string", length: 255 },
    isSubscribed: { type: "boolean" },
    createdAt: { type: "date", columnType: DATETIME_TYPE },
    updatedAt: { type: "date", columnType: DATETIME_TYPE, onUpdate: () => new Date() },
  },
  // 设置联合唯一约束
  indexes: [
    { properties: ["noticeType", "messageType"], options: { unique: true } },
  ],
});
