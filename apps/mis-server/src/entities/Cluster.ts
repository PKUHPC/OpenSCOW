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
import { DATETIME_TYPE } from "src/utils/orm";

export enum ClusterOnlineStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

@Entity()
export class Cluster {
  @PrimaryKey()
    id!: number;

  @Property({ unique: true })
    clusterId: string;

  @Enum({ items: () => ClusterOnlineStatus,
    default: ClusterOnlineStatus.ONLINE, comment: Object.values(ClusterOnlineStatus).join(", ") })
    onlineStatus: ClusterOnlineStatus;

  @Property({ nullable: true })
    operatorId?: string;

  @Property({ default: "" })
    comment: string;

  @Property({ columnType: DATETIME_TYPE, nullable: true })
    createTime: Date;

  @Property({ columnType: DATETIME_TYPE, nullable: true, onUpdate: () => new Date() })
    updateTime: Date;

  constructor(init: {
    clusterId: string;
    onlineStatus?: ClusterOnlineStatus;
    operatorId?: string;
    comment?: string;
    createTime?: Date;
    updateTime?: Date;
  }) {
    this.clusterId = init.clusterId;
    this.onlineStatus = init.onlineStatus || ClusterOnlineStatus.ONLINE;
    this.operatorId = init.operatorId;
    this.comment = init.comment || "";
    this.createTime = init.createTime ?? new Date();
    this.updateTime = init.updateTime ?? new Date();
  }
}
