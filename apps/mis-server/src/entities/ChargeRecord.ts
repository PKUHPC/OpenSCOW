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

import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { DecimalType } from "src/utils/decimal";
import { type AnyJson } from "src/utils/types";

@Entity()
@Index({ name: "query_info", properties: ["time", "tenantName", "accountName", "type"] })
@Index({ name: "static_info", properties: ["time", "accountName", "amount"] })
export class ChargeRecord {
  @PrimaryKey()
  id!: number;

  @Index({ name: "time" })
  @Property()
  time: Date;

  @Index()
  @Property()
  tenantName: string;

  @Index()
  @Property({ nullable: true })
  accountName?: string;

  @Index()
  @Property({ nullable: true })
  userId?: string;

  @Index()
  @Property()
  type: string;

  @Property({ type: DecimalType })
  amount: Decimal = new Decimal(0);

  @Property()
  comment: string;

  @Property({ type: "json", nullable: true })
  metadata?: AnyJson;

  constructor(init: {
    id?: number;
    time: Date,
    type: string;
    target: Tenant | Account;
    userId?: string;
    comment: string;
    amount: Decimal,
    metadata?: AnyJson,
  }) {
    if (init.id) {
      this.id = init.id;
    }
    this.type = init.type;
    this.time = init.time;
    if (init.target instanceof Tenant) {
      this.tenantName = init.target.name;
    } else {
      this.tenantName = init.target.tenant.getProperty("name");
      this.accountName = init.target.accountName;
    }
    this.userId = init.userId;
    this.comment = init.comment;
    this.amount = init.amount;
    this.metadata = init.metadata;
  }

}
