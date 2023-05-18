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
import { Loaded } from "@mikro-orm/core";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal, decimalToMoney } from "@scow/lib-decimal";
import { blockAccount, blockUserInAccount, unblockAccount, unblockUserInAccount } from "src/bl/block";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { PayRecord } from "src/entities/PayRecord";
import { Tenant } from "src/entities/Tenant";
import { UserAccount } from "src/entities/UserAccount";
import { ClusterPlugin } from "src/plugins/clusters";
import { callHook } from "src/plugins/hookClient";

interface PayRequest {
  target: Tenant | Loaded<Account, "tenant">;
  amount: Decimal;
  comment: string;
  type: string;
  ipAddress: string;
  operatorId: string;
}

export async function pay(
  request: PayRequest, em: SqlEntityManager,
  logger: Logger, clusterPlugin: ClusterPlugin,
) {
  const {
    target, amount, comment, operatorId, ipAddress, type,
  } = request;


  const record = new PayRecord({
    time: new Date(),
    target,
    operatorId,
    type,
    comment,
    amount,
    ipAddress,
  });

  em.persist(record);

  const prevBalance = target.balance;
  target.balance = target.balance.plus(amount);

  if (target instanceof Account) {
    await callHook("accountPaid", { accountName: target.accountName, amount: decimalToMoney(amount) }, logger);
  } else {
    await callHook("tenantPaid", { tenantName: target.name, amount: decimalToMoney(amount) }, logger);
  }

  if (target instanceof Account && prevBalance.lte(0) && target.balance.gt(0)) {
    logger.info("Unblock account %s", target.accountName);
    await unblockAccount(target, clusterPlugin.clusters, logger);
  }

  return {
    currentBalance: target.balance,
    previousBalance: prevBalance,
  };
}

type ChargeRequest = {
  target: Loaded<Account, "tenant"> | Tenant;
  amount: Decimal;
  comment: string;
  type: string;
};

export async function charge(
  request: ChargeRequest, em: SqlEntityManager,
  logger: Logger, clusterPlugin: ClusterPlugin,
) {
  const { target, amount, comment, type } = request;

  const record = new ChargeRecord({
    time: new Date(),
    type,
    target,
    comment,
    amount,
  });

  em.persist(record);

  const prevBalance = target.balance;
  target.balance = target.balance.minus(amount);

  if (target instanceof Account && prevBalance.gt(0) && target.balance.lte(0)) {
    logger.info("Block account %s due to out of balance.", target.accountName);
    await blockAccount(target, clusterPlugin.clusters, logger);
  }

  return {
    currentBalance: target.balance,
    previousBalance: prevBalance,
  };
}

export async function addJobCharge(
  ua: Loaded<UserAccount, "user" | "account">,
  charge: Decimal, clusterPlugin: ClusterPlugin, logger: Logger,
) {
  if (ua.usedJobCharge && ua.jobChargeLimit) {
    ua.usedJobCharge = ua.usedJobCharge.plus(charge);
    if (ua.usedJobCharge.gt(ua.jobChargeLimit)) {
      await blockUserInAccount(ua, clusterPlugin, logger);
    } else {
      await unblockUserInAccount(ua, clusterPlugin, logger);
    }
  }
}

export async function setJobCharge(
  ua: Loaded<UserAccount, "user" | "account">,
  charge: Decimal, clusterPlugin: ClusterPlugin, logger: Logger,
) {
  ua.jobChargeLimit = charge;
  if (!ua.usedJobCharge) {
    ua.usedJobCharge = new Decimal(0);
  } else {
    if (ua.jobChargeLimit.lt(ua.usedJobCharge)) {
      await blockUserInAccount(ua, clusterPlugin, logger);
    } else {
      await unblockUserInAccount(ua, clusterPlugin, logger);
    }
  }
}
