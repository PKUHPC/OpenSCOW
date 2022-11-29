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

import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { DecimalType } from "src/utils/decimal";
import { DATETIME_TYPE } from "src/utils/orm";

@Entity()
export class PayRecord {
  @PrimaryKey()
    id!: number;

  @Property({ columnType: DATETIME_TYPE })
    time: Date;

  @Property()
    tenantName: string;

  @Property({ nullable: true })
    accountName?: string;

  @Property()
    type: string;

  @Property({ type: DecimalType })
    amount: Decimal = new Decimal(0);

  @Property()
    operatorId: string;

  @Property()
    ipAddress: string;

  @Property()
    comment: string;

  constructor(init: {
    id?: number;
    time: Date,
    type: string,
    target: Tenant | Account;
    operatorId: string;
    comment: string;
    amount: Decimal,
    ipAddress: string,
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
    this.operatorId = init.operatorId;
    this.comment = init.comment;
    this.amount = init.amount;
    this.ipAddress = init.ipAddress;
  }

}
