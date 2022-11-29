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
import { JobInfo } from "src/entities/JobInfo";
import { DecimalType } from "src/utils/decimal";
import { DATETIME_TYPE } from "src/utils/orm";

@Entity()
export class JobPriceChange {
  @PrimaryKey()
    id!: number;

  @Property({
    type: "json",
    comment: "{ biJobIndex: number; tenantPrice: tenantPrice.toFixed(4), accountPrice: accountPrice.toFixed(4) }[]",
  })
    jobs: { biJobIndex: number; tenantPrice: string; accountPrice: string; }[];

  @Property()
    reason: string;

  @Property({ type: DecimalType, nullable: true })
    newTenantPrice?: Decimal;

  @Property({ type: DecimalType, nullable: true })
    newAccountPrice?: Decimal;

  @Property()
    operatorId: string;

  @Property()
    ipAddress: string;

  @Property({ columnType: DATETIME_TYPE })
    time: Date;

  constructor(init: {
    jobs: JobInfo[];
    newTenantPrice?: Decimal,
    newAccountPrice?: Decimal,
    time: Date,
    reason: string,
    operatorId: string,
    ipAddress: string,
  }) {
    this.time = init.time;
    this.newTenantPrice = init.newTenantPrice;
    this.newAccountPrice = init.newAccountPrice;
    this.jobs = init.jobs.map((x) => ({
      biJobIndex: x.biJobIndex,
      accountPrice: x.accountPrice.toFixed(4),
      tenantPrice: x.tenantPrice.toFixed(4),
    }));
    this.reason = init.reason;
    this.operatorId = init.operatorId;
    this.ipAddress = init.ipAddress;
  }
}

