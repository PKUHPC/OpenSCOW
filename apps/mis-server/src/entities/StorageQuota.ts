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

import { Entity, IdentifiedReference, ManyToOne, PrimaryKey, Property } from
  "@mikro-orm/core";
import { User } from "src/entities/User";
import { EntityOrRef, toRef } from "src/utils/orm";

@Entity()
export class StorageQuota {
  @PrimaryKey()
    id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", wrappedReference: true })
    user: IdentifiedReference<User>;

  @Property()
    cluster: string;

  // 和后台统一，为B。1PB=10^15B，应该一个int就够用了
  @Property({ columnType: "int" })
    storageQuota: number;

  constructor(init: {
    user: EntityOrRef<User>,
    cluster: string,
    storageQuota: number,
  }) {
    this.user = toRef(init.user);
    this.cluster = init.cluster;
    this.storageQuota = init.storageQuota;
  }

}
