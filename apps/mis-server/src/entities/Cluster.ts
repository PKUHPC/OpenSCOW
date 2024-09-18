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

import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";
import { DATETIME_TYPE } from "src/utils/orm";

export enum ClusterActivationStatus {
  ACTIVATED = "ACTIVATED",
  DEACTIVATED = "DEACTIVATED",
}

export interface LastActivationOperation {
  // activation operator userId
  operatorId?: string,
  // comment only when deactivate a cluster
  deactivationComment?: string,
}

@Entity()
export class Cluster {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  clusterId: string;

  @Enum({ items: () => ClusterActivationStatus,
    default: ClusterActivationStatus.ACTIVATED, comment: Object.values(ClusterActivationStatus).join(", ") })
  activationStatus: ClusterActivationStatus;

  @Property({ type: "json", nullable: true })
  lastActivationOperation?: LastActivationOperation;

  @Property({ columnType: DATETIME_TYPE, nullable: true })
  createTime: Date;

  @Property({ columnType: DATETIME_TYPE, nullable: true, onUpdate: () => new Date() })
  updateTime: Date;

  constructor(init: {
    clusterId: string;
    activationStatus?: ClusterActivationStatus;
    lastActivationOperation?: LastActivationOperation;
    createTime?: Date;
    updateTime?: Date;
  }) {
    this.clusterId = init.clusterId;
    this.activationStatus = init.activationStatus ?? ClusterActivationStatus.ACTIVATED;
    this.lastActivationOperation = init.lastActivationOperation;
    this.createTime = init.createTime ?? new Date();
    this.updateTime = init.updateTime ?? new Date();
  }
}
