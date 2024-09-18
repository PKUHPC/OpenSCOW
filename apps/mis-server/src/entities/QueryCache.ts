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

import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { DATETIME_TYPE } from "src/utils/orm";

@Entity()
export class QueryCache {
  @PrimaryKey()
  id!: number;

  @Property()
  queryKey: string;

  @Property({ type: "json" })
  queryResult: any;

  @Property({ columnType: DATETIME_TYPE })
  timestamp: Date;

  constructor(init: {
    id?: number;
    queryKey: string,
    queryResult: string,
    timestamp?: Date,
  }) {
    if (init.id) {
      this.id = init.id;
    }
    this.queryKey = init.queryKey;
    this.queryResult = init.queryResult;
    this.timestamp = init.timestamp ?? new Date();
  }
}
