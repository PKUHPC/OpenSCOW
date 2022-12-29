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

import { Collection, Entity,
  IdentifiedReference, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property,
} from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { UserAccount } from "src/entities/UserAccount";
import { DECIMAL_DEFAULT_RAW, DecimalType } from "src/utils/decimal";
import { EntityOrRef, toRef } from "src/utils/orm";

@Entity()
export class Account {
  @PrimaryKey()
    id!: number;

  @Property({ unique: true })
    accountName: string;

  @ManyToOne(() => Tenant, { wrappedReference: true })
    tenant: IdentifiedReference<Tenant>;

  @Property()
    blocked: boolean;

  @OneToMany(() => UserAccount, (u) => u.account)
    users = new Collection<UserAccount>(this);

  @OneToOne(() => AccountWhitelist, (u) => u.account, {
    nullable: true, wrappedReference: true, unique: true, owner: true,
  })
    whitelist?: IdentifiedReference<AccountWhitelist>;

  @Property({ default: "" })
    comment: string;

  @Property({ type: DecimalType, defaultRaw: DECIMAL_DEFAULT_RAW })
    balance: Decimal = new Decimal(0);

  constructor(init: {
    accountName: string;
    whitelist?: EntityOrRef<AccountWhitelist>;
    tenant: EntityOrRef<Tenant>;
    blocked: boolean;
    comment: string;
  }) {
    this.accountName = init.accountName;
    this.blocked = init.blocked;
    this.tenant = toRef(init.tenant);
    if (init.whitelist) {
      this.whitelist = toRef(init.whitelist);
    }
    this.comment = init.comment;
  }



}
