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

import { Entity, ManyToOne, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { User } from "src/entities/User";
import { CURRENT_TIMESTAMP, EntityOrRef, toRef } from "src/utils/orm";

export enum OperationResult {
  UNKNOWN = "UNKNOWN",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

@Entity()
export class OperationLog {
  @PrimaryKey()
    id!: number;

  @ManyToOne(() => User, { wrappedReference: true })
    operator!: Ref<User>;

  @Property()
    operatorIp!: string;

  @Property({ defaultRaw: CURRENT_TIMESTAMP })
    operationTime!: Date;

  @Property()
    operationCode!: number;

  @Property({ columnType: "text" })
    operationContent!: string;

  @Property({ defaultRaw: OperationResult.UNKNOWN })
    operationResult!: OperationResult;


  constructor(init: {
      operator: EntityOrRef<User>;
      operatorIp: string;
      operationTime?: Date;
      operationCode: number;
      operationContent: string;
      operationResult: OperationResult
    }) {
    this.operator = toRef(init.operator);
    this.operatorIp = init.operatorIp;
    if (init.operationTime) {
      this.operationTime = init.operationTime;
    }
    this.operationCode = init.operationCode;
    this.operationContent = init.operationContent;
    this.operationResult = init.operationResult;
  }

}
