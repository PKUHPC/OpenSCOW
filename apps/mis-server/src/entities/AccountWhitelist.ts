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

import { Entity, OneToOne, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { Account } from "src/entities/Account";
import { EntityOrRef, toRef } from "src/utils/orm";

@Entity()
export class AccountWhitelist {
  @PrimaryKey()
  id!: number;

  @OneToOne(() => Account, (a) => a.whitelist, { ref: true, nullable: false, unique: true })
  account: Ref<Account>;

  @Property()
  time: Date;

  @Property()
  comment: string;

  @Property()
  operatorId: string;

  // 当expirationTime为undefined时，即为永久有效
  @Property({ nullable: true })
  expirationTime?: Date;

  constructor(init: {
    account: EntityOrRef<Account>,
    time?: Date,
    comment: string
    operatorId: string;
    expirationTime?: Date
  }) {
    this.account = toRef(init.account);
    this.time = init.time ?? new Date();
    this.comment = init.comment;
    this.operatorId = init.operatorId;
    // undefined为永久有效
    this.expirationTime = init.expirationTime ?? undefined;
  }
}
