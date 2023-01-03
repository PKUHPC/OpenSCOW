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
import { Account } from "src/entities/Account";
import { UserAccount, UserStatus } from "src/entities/UserAccount";
import { ClusterPlugin } from "src/plugins/clusters";

/**
 * Blocks the account in the slurm.
 * If it is whitelisted, it doesn't block.
 * Call flush after this.
 *
 * @returns Operation result
**/
export async function blockAccount(
  account: Account, clusterPlugin: ClusterPlugin["clusters"], logger: Logger,
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

  return "OK";
}

/**
 * User and account must be loaded.
 * Call flush after this.
 * */
export async function blockUserInAccount(ua: UserAccount, clusterPlugin: ClusterPlugin, logger: Logger) {
  if (ua.status === UserStatus.BLOCKED) {
    return;
  }

  await clusterPlugin.clusters.callOnAll(logger, async (ops) => ops.user.blockUserInAccount({
    request: {
      accountName: ua.account.getProperty("accountName"),
      userId: ua.user.getProperty("userId"),
    },
    logger,
  }));

  ua.status = UserStatus.BLOCKED;
}

/**
 * User and account must be loaded.
 * Call flush after this.
 * */
export async function unblockUserInAccount(ua: UserAccount, clusterPlugin: ClusterPlugin, logger: Logger) {
  if (ua.status === UserStatus.UNBLOCKED) {
    return;

  }

  await clusterPlugin.clusters.callOnAll(logger, async (ops) => ops.user.unblockUserInAccount({
    request: {
      accountName: ua.account.getProperty("accountName"),
      userId: ua.user.getProperty("userId"),
    },
    logger,
  }));

  ua.status = UserStatus.UNBLOCKED;
}

