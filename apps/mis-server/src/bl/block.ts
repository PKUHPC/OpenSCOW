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
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { Account } from "src/entities/Account";
import { SystemState } from "src/entities/SystemState";
import { UserAccount, UserStatus } from "src/entities/UserAccount";
import { ClusterPlugin } from "src/plugins/clusters";
import { callHook } from "src/plugins/hookClient";


/**
 * Update block status of accounts and users in the slurm.
 * If it is whitelisted, it doesn't block.
 *
 * @returns Updated number of blocked accounts and users
 **/
export async function updateBlockStatusInSlurm(
  em: SqlEntityManager<MySqlDriver>, clusterPlugin: ClusterPlugin["clusters"], logger: Logger,
) {
  const accounts = await em.find(Account, { blocked: true });
  for (const account of accounts) {
    if (account.whitelist) {
      continue;
    }
    await clusterPlugin.callOnAll(logger, async (ops) => await ops.account.blockAccount({
      request: { accountName: account.accountName },
      logger,
    }));
  }

  const userAccounts = await em.find(UserAccount, {
    status: UserStatus.BLOCKED,
  }, { populate: ["user", "account"]});
  for (const ua of userAccounts) {
    await clusterPlugin.callOnAll(logger, async (ops) => ops.user.blockUserInAccount({
      request: {
        accountName: ua.account.getProperty("accountName"),
        userId: ua.user.getProperty("userId"),
      },
      logger,
    }));
  }
  const updateBlockTime = await em.upsert(SystemState, {
    key: SystemState.KEYS.UPDATE_SLURM_BLOCK_STATUS,
    value: new Date().toISOString(),
  });
  await em.persistAndFlush(updateBlockTime);

  logger.info("Updated block status in slurm of the following accounts: %o", accounts.map((x) => x.accountName));
  logger.info("Updated block status in slurm of the following user account: %o",
    userAccounts.map((x) => [x.user.getProperty("userId"), x.account.getProperty("accountName")]));

  return {
    blockedAccounts: accounts.map((x) => x.id),
    blockedUserAccounts: userAccounts.map((x) => x.id),
  };

}

/**
 * Blocks the account in the slurm.
 * If it is whitelisted, it doesn't block.
 * Call flush after this.
 *
 * @returns Operation result
**/
export async function blockAccount(
  account: Loaded<Account, "tenant">, clusterPlugin: ClusterPlugin["clusters"], logger: Logger,
): Promise<"AlreadyBlocked" | "Whitelisted" | "OK"> {

  if (account.blocked) { return "AlreadyBlocked"; }

  if (account.whitelist) {
    return "Whitelisted";
  }

  await clusterPlugin.callOnAll(logger, async (ops) => {
    const resp = await ops.account.blockAccount({
      request: { accountName: account.accountName },
      logger,
    });
    if (resp.code === "NOT_FOUND") {
      throw new Error(`Account ${account.accountName} not found`);
    }
  });

  account.blocked = true;

  await callHook("accountBlocked", { accountName: account.accountName, tenantName: account.tenant.$.name }, logger);

  return "OK";
}

/**
 * Unblocks the account in the slurm.
 * If it is whitelisted, it doesn't block.
 * Call flush after this.
 *
 * @returns Operation result
**/
export async function unblockAccount(
  account: Account, clusterPlugin: ClusterPlugin["clusters"], logger: Logger,
): Promise<"OK" | "ALREADY_UNBLOCKED"> {

  if (!account.blocked) { return "ALREADY_UNBLOCKED"; }

  await clusterPlugin.callOnAll(logger, async (ops) => {
    const resp = await ops.account.unblockAccount({
      request: { accountName: account.accountName },
      logger,
    });

    if (resp.code === "NOT_FOUND") {
      throw new Error(`Account ${account.accountName} not found`);
    }
  });

  account.blocked = false;
  await callHook("accountUnblocked", { accountName: account.accountName }, logger);

  return "OK";
}

/**
 * UA's account.accountName and user.userId must be loaded
 * Call flush after this.
 * */
export async function blockUserInAccount(
  ua: Loaded<UserAccount, "user" | "account">,
  clusterPlugin: ClusterPlugin, logger: Logger,
) {
  if (ua.status === UserStatus.BLOCKED) {
    return;
  }

  const accountName = ua.account.$.accountName;
  const userId = ua.user.$.userId;

  await clusterPlugin.clusters.callOnAll(logger, async (ops) => ops.user.blockUserInAccount({
    request: {
      accountName,
      userId,
    },
    logger,
  }));

  ua.status = UserStatus.BLOCKED;

  await callHook("userBlockedInAccount", {
    accountName,
    userId,
  }, logger);
}

/**
 * Call flush after this.
 * */
export async function unblockUserInAccount(
  ua: Loaded<UserAccount, "user" | "account">,
  clusterPlugin: ClusterPlugin, logger: Logger,
) {
  if (ua.status === UserStatus.UNBLOCKED) {
    return;
  }

  const accountName = ua.account.getProperty("accountName");
  const userId = ua.user.getProperty("userId");

  await clusterPlugin.clusters.callOnAll(logger, async (ops) => ops.user.unblockUserInAccount({
    request: { accountName, userId },
    logger,
  }));

  ua.status = UserStatus.UNBLOCKED;

  await callHook("userUnblockedInAccount", {
    accountName, userId,
  }, logger);
}

