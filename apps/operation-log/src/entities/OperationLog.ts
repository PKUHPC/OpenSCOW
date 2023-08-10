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

import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP } from "src/utils/orm";

export enum OperationResult {
  UNKNOWN = "UNKNOWN",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

@Entity()
export class OperationLog {
  @PrimaryKey()
    id!: number;

  @Property()
    operatorUserId!: string;

  @Property()
    operatorIp!: string;

  @Property({ defaultRaw: CURRENT_TIMESTAMP })
    operationTime?: Date;

  @Enum({ items: () => OperationResult, comment: Object.values(OperationResult).join(", ") })
    operationResult: OperationResult;

  @Property({ type: "json", nullable: true })
    metaData?: { [key: string]: any; };

  constructor(init: {
      operatorUserId: string;
      operatorIp: string;
      operationTime?: Date;
      operationResult: OperationResult;
      metaData: { [key: string]: any };
    }) {
    this.operatorUserId = init.operatorUserId;
    this.operatorIp = init.operatorIp;
    if (init.operationTime) {
      this.operationTime = init.operationTime;
    }
    this.operationResult = init.operationResult;
    this.metaData = init.metaData;
  }

}

