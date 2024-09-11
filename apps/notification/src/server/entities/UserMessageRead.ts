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

import { EntitySchema, type Ref } from "@mikro-orm/core";
import { DATETIME_TYPE, toRef } from "src/utils/orm";

import { Message } from "./Message";

export enum ReadStatus {
  UNREAD = 0,
  READ,
  ALL,
}

export enum TargetType {
  USER = 0,
  ACCOUNT,
  TENANT,
  FULL_SITE,
}

export class UserMessageRead {
  id!: number;
  userId: string;
  status: ReadStatus;
  readTime?: Date;
  isDeleted: boolean;
  message!: Ref<Message>;
  createdAt = new Date();
  updatedAt = new Date();

  constructor(init: {
    userId: string;
    message: Message;
    status?: ReadStatus;
    readTime?: Date;
    isDeleted?: boolean;
  }) {
    this.userId = init.userId;
    this.status = init.status ?? ReadStatus.UNREAD;
    this.readTime = init.readTime;
    this.isDeleted = init.isDeleted ?? false;
    this.message = toRef(init.message);
  }
}


export const UserMessageReadSchema = new EntitySchema<UserMessageRead>({
  class: UserMessageRead,
  indexes: [
    { name: "idx_user_id", properties: ["userId"]},
  ],
  properties: {
    id: { type: Number, primary: true },
    userId: { type: String, length: 255 },
    message: { kind: "m:1", entity: () => Message },
    status: { enum: true, items: () => ReadStatus },
    readTime: { type: Date, nullable: true },
    isDeleted: { type: "boolean" },
    createdAt: { type: "date", columnType: DATETIME_TYPE },
    updatedAt: { type: "date", columnType: DATETIME_TYPE, onUpdate: () => new Date() },
  },
});
