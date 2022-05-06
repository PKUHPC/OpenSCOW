import { Logger } from "@ddadaal/tsgrpc-server";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal } from "@scow/lib-decimal";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { PayRecord } from "src/entities/PayRecord";
import { Tenant } from "src/entities/Tenant";
import { ClusterPlugin } from "src/plugins/clusters";

interface PayRequest {
  target: Tenant | Account;
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

  if (target instanceof Account && prevBalance.lte(0) && target.balance.gt(0)) {
    logger.info("Unblock account %s", target.accountName);
    await target.unblock(clusterPlugin.clusters);
  }

  return {
    currentBalance: target.balance,
    previousBalance: prevBalance,
  };
}

type ChargeRequest = {
  target: Account | Tenant;
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
    await target.block(clusterPlugin.clusters);
  }

  return {
    currentBalance: target.balance,
    previousBalance: prevBalance,
  };
}
