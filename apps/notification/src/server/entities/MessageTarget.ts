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

import { EntitySchema, Ref } from "@mikro-orm/core";
import { NoticeType } from "src/models/notice-type";
import { DATETIME_TYPE, toRef } from "src/utils/orm";

import { Message } from "./Message";
import { TargetType } from "./UserMessageRead";

export class MessageTarget {
  id!: bigint;
  targetType: TargetType;
  targetId?: string;
  noticeTypes: NoticeType[];
  message!: Ref<Message>;
  createdAt = new Date();
  updatedAt = new Date();

  constructor(init: {
    targetType: TargetType;
    targetId?: string;
    noticeTypes: NoticeType[]
    message: Message;
  }) {
    this.targetType = init.targetType;
    this.targetId = init.targetId;
    this.noticeTypes = init.noticeTypes;
    this.message = toRef(init.message);
  }
}


export const MessageTargetSchema = new EntitySchema<MessageTarget>({
  class: MessageTarget,
  tableName: "message_targets",
  properties: {
    id: { type: "bigint", primary: true },
    noticeTypes: { type: "array" },
    targetType: { enum: true, items: () => TargetType, index: true },
    targetId: { type: String, length: 255, index: true, nullable: true },
    message: { kind: "m:1", entity: () => Message, deleteRule: "cascade" },
    createdAt: { type: "date", columnType: DATETIME_TYPE },
    updatedAt: { type: "date", columnType: DATETIME_TYPE, onUpdate: () => new Date() },
  },
});
