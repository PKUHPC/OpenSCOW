import { Collection, Entity,
  IdentifiedReference, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property,
} from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { UserAccount } from "src/entities/UserAccount";
import { AccountServiceClient } from "src/generated/clusterops/account";
import { ClusterPlugin } from "src/plugins/clusters";
import { DECIMAL_DEFAULT_RAW,DecimalType } from "src/utils/decimal";
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

  /**
     * Call flush after this.
     * this didn't consider whitelist
     * */
  async block(clusterPlugin: ClusterPlugin["clusters"]) {

    if (this.blocked) { return; }

    await clusterPlugin.callOnAll(
      AccountServiceClient,
      { method: "blockAccount", req: {
        accountName: this.accountName,
      } },
    );

    this.blocked = true;
  }

  /**
     * Call flush after this.
     * */
  async unblock(clusterPlugin: ClusterPlugin["clusters"]) {

    if (!this.blocked) { return; }

    await clusterPlugin.callOnAll(
      AccountServiceClient,
      { method: "unblockAccount", req: {
        accountName: this.accountName,
      } },
    );

    this.blocked = false;
  }

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
