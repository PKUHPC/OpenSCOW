import { Entity, IdentifiedReference,
  ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import { Account } from "src/entities/Account";
import { User } from "src/entities/User";
import { UserServiceClient } from "src/generated/clusterops/user";
import { ClusterPlugin } from "src/plugins/clusters";
import { DecimalType } from "src/utils/decimal";
import { EntityOrRef, toRef } from "src/utils/orm";

export enum UserStatus {
  UNBLOCKED = "UNBLOCKED",
  BLOCKED = "BLOCKED",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

@Entity()
export class UserAccount {
  @PrimaryKey()
    id!: number;

  @ManyToOne(() => User,  { onDelete: "CASCADE", wrappedReference: true })
    user: IdentifiedReference<User>;

  @ManyToOne(() => Account,  { onDelete: "CASCADE", wrappedReference: true })
    account: IdentifiedReference<Account>;

  @Property({ columnType: "varchar(10)", comment: Object.values(UserStatus).join(", ") })
    status: UserStatus;

  async addJobCharge(charge: Decimal, clusterPlugin: ClusterPlugin) {
    if (this.usedJobCharge && this.jobChargeLimit) {
      this.usedJobCharge = this.usedJobCharge.plus(charge);
      if (this.usedJobCharge.gt(this.jobChargeLimit)) {
        await this.block(clusterPlugin);
      } else {
        await this.unblock(clusterPlugin);
      }
    }
  }

  async setJobCharge(charge: Decimal, clusterPlugin: ClusterPlugin) {
    this.jobChargeLimit = charge;
    if (!this.usedJobCharge) {
      this.usedJobCharge = new Decimal(0);
    } else {
      if (this.jobChargeLimit.lt(this.usedJobCharge)) {
        await this.block(clusterPlugin);
      } else {
        await this.unblock(clusterPlugin);
      }
    }
  }

  /**
   * User and account must be loaded.
   * Call flush after this.
   * */
  async block(clusterPlugin: ClusterPlugin) {
    if (this.status === UserStatus.BLOCKED) {
      return;
    }

    await clusterPlugin.clusters.callOnAll(
      UserServiceClient,
      { method: "blockUserInAccount", req: {
        accountName: this.account.getProperty("accountName"),
        userId: this.user.getProperty("userId"),
      } },
    );

    this.status = UserStatus.BLOCKED;
  }

  /**
   * User and account must be loaded.
   * Call flush after this.
   * */
  async unblock(clusterPlugin: ClusterPlugin) {
    if (this.status === UserStatus.UNBLOCKED) {
      return;
    }

    await clusterPlugin.clusters.callOnAll(
      UserServiceClient,
      { method: "unblockUserInAccount", req: {
        accountName: this.account.getProperty("accountName"),
        userId: this.user.getProperty("userId"),
      } },
    );

    this.status = UserStatus.UNBLOCKED;
  }

  @Property({ columnType: "varchar(10)", comment: Object.values(UserRole).join(", ") })
    role: UserRole;

  @Property({ type: DecimalType, nullable: true })
    usedJobCharge?: Decimal;

  @Property({ type: DecimalType, nullable: true })
    jobChargeLimit?: Decimal;

  constructor(init: {
    user: EntityOrRef<User>,
    account: EntityOrRef<Account>,
    status: UserStatus,
    role: UserRole,
    jobChargeLimit?: Decimal,
    usedJobCharge?: Decimal,
  }) {
    this.user = toRef(init.user);
    this.account = toRef(init.account);
    this.status = init.status;
    this.role = init.role;
    this.jobChargeLimit = init.jobChargeLimit;
    this.usedJobCharge = init.usedJobCharge;
  }
}
