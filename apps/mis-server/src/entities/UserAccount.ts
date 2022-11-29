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

import { Logger } from "@ddadaal/tsgrpc-server";
import { Entity, IdentifiedReference,
  ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import { Account } from "src/entities/Account";
import { User } from "src/entities/User";
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

  @ManyToOne(() => User, { onDelete: "CASCADE", wrappedReference: true })
    user: IdentifiedReference<User>;

  @ManyToOne(() => Account, { onDelete: "CASCADE", wrappedReference: true })
    account: IdentifiedReference<Account>;

  @Property({ columnType: "varchar(10)", comment: Object.values(UserStatus).join(", ") })
    status: UserStatus;

  async addJobCharge(charge: Decimal, clusterPlugin: ClusterPlugin, logger: Logger) {
    if (this.usedJobCharge && this.jobChargeLimit) {
      this.usedJobCharge = this.usedJobCharge.plus(charge);
      if (this.usedJobCharge.gt(this.jobChargeLimit)) {
        await this.block(clusterPlugin, logger);
      } else {
        await this.unblock(clusterPlugin, logger);
      }
    }
  }

  async setJobCharge(charge: Decimal, clusterPlugin: ClusterPlugin, logger: Logger) {
    this.jobChargeLimit = charge;
    if (!this.usedJobCharge) {
      this.usedJobCharge = new Decimal(0);
    } else {
      if (this.jobChargeLimit.lt(this.usedJobCharge)) {
        await this.block(clusterPlugin, logger);
      } else {
        await this.unblock(clusterPlugin, logger);
      }
    }
  }

  /**
   * User and account must be loaded.
   * Call flush after this.
   * */
  async block(clusterPlugin: ClusterPlugin, logger: Logger) {
    if (this.status === UserStatus.BLOCKED) {
      return;
    }

    await clusterPlugin.clusters.callOnAll(logger, async (ops) => ops.user.blockUserInAccount({
      request: {
        accountName: this.account.getProperty("accountName"),
        userId: this.user.getProperty("userId"),
      },
      logger,
    }));

    this.status = UserStatus.BLOCKED;
  }

  /**
   * User and account must be loaded.
   * Call flush after this.
   * */
  async unblock(clusterPlugin: ClusterPlugin, logger: Logger) {
    if (this.status === UserStatus.UNBLOCKED) {
      return;

    }

    await clusterPlugin.clusters.callOnAll(logger, async (ops) => ops.user.unblockUserInAccount({
      request: {
        accountName: this.account.getProperty("accountName"),
        userId: this.user.getProperty("userId"),
      },
      logger,
    }));

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
