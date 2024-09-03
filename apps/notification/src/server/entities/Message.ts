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

import { Collection, EntitySchema } from "@mikro-orm/core";
import { DATETIME_TYPE } from "src/utils/orm";

import { MessageTarget } from "./MessageTarget";
import { TargetType, UserMessageRead } from "./UserMessageRead";

export enum SenderType {
  SYSTEM = 0,
  PLATFORM_ADMIN,
  TENANT_ADMIN,
}

export class Message {
  id!: number;
  senderType: SenderType;
  senderId!: string;
  targetType: TargetType;
  messageType: string;
  category: string;
  descriptionData: string[];
  metadata: Record<string, any>;
  createdAt = new Date();
  updatedAt = new Date();
  userMessageRead = new Collection<UserMessageRead>(this);
  messageTarget = new Collection<MessageTarget>(this);


  constructor(init: {
    senderId: string;
    senderType: SenderType;
    targetType: TargetType;
    messageType: string;
    category: string;
    metadata?: Record<string, any>;
    descriptionData?: string[];
  }) {
    this.senderId = init.senderId;
    this.senderType = init.senderType;
    this.targetType = init.targetType;
    this.messageType = init.messageType;
    this.category = init.category;
    this.metadata = init.metadata ?? {};
    this.descriptionData = init.descriptionData ?? [];
  }
}


export const MessageSchema = new EntitySchema<Message>({
  class: Message,
  tableName: "messages",
  properties: {
    id: { type: "number", primary: true },
    senderType: { enum: true, items: () => SenderType, index: true, nullable: false },
    senderId: { type: String, length: 255, index: true, nullable: false },
    targetType: { enum: true, items: () => TargetType },
    metadata: { type: "json" },
    descriptionData: { type: "array" },
    messageType: { type: "string", length: 255 },
    category: { type: "string", length: 255, nullable: false },
    userMessageRead: {
      kind: "1:m",
      entity: () => UserMessageRead,
      mappedBy: (userMessageRead) => userMessageRead.message,
    },
    messageTarget: { kind: "1:m", entity: () => MessageTarget, mappedBy: (messageTarget) => messageTarget.message },
    createdAt: { type: "date", columnType: DATETIME_TYPE },
    updatedAt: { type: "date", columnType: DATETIME_TYPE, onUpdate: () => new Date() },
  },
});
