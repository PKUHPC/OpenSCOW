import { Entity, IdentifiedReference, OneToOne,PrimaryKey, Property } from "@mikro-orm/core";
import { Account } from "src/entities/Account";
import { EntityOrRef, toRef } from "src/utils/orm";

@Entity()
export class AccountWhitelist {
  @PrimaryKey()
    id!: number;

  @OneToOne(() => Account, (a) => a.whitelist, { wrappedReference: true, nullable: false, unique: true })
    account: IdentifiedReference<Account>;

  @Property()
    time: Date;

  @Property()
    comment: string;

  @Property()
    operatorId: string;

  constructor(init: {
    account: EntityOrRef<Account>,
    time?: Date,
    comment: string
    operatorId: string;
  }) {
    this.account = toRef(init.account);
    this.time = init.time ?? new Date();
    this.comment = init.comment;
    this.operatorId = init.operatorId;
  }
}
