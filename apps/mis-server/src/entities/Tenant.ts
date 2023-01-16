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
import { DECIMAL_DEFAULT_RAW, DecimalType } from "src/utils/decimal";
import { DATETIME_TYPE } from "src/utils/orm";

@Entity()
export class Tenant {

  @PrimaryKey()
    id!: number;

  @Property({ unique: true })
    name: string;

  @Property({ type: DecimalType, defaultRaw: DECIMAL_DEFAULT_RAW })
    balance: Decimal = new Decimal(0);

  @Property({ columnType: DATETIME_TYPE, defaultRaw: "CURRENT_TIMESTAMP" })
    createTime: Date;

  constructor(init: {
    name: string,
    createTime?: Date,
  }) {
    this.name = init.name;
    this.createTime = init.createTime ?? new Date();
  }

}
