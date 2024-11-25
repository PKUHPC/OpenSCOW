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
  id!: bigint;
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
  uniques: [
    { name: "idx_user_message_unique", properties: ["userId", "message"]},
  ],
  properties: {
    id: { type: "bigint", primary: true },
    userId: { type: String, length: 255 },
    message: { kind: "m:1", entity: () => Message, deleteRule: "cascade" },
    status: { enum: true, items: () => ReadStatus },
    readTime: { type: Date, nullable: true },
    isDeleted: { type: "boolean", default: false },
    createdAt: { type: "date", columnType: DATETIME_TYPE },
    updatedAt: { type: "date", columnType: DATETIME_TYPE, onUpdate: () => new Date() },
  },
});
