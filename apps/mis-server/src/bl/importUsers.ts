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
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { toRef } from "src/utils/orm";

export interface ImportUsersData {
  accounts: {
    accountName: string;
    users: {userId: string; userName: string; state: string}[];
    owner: string;
  }[];
}

export async function importUsers(data: ImportUsersData, em: SqlEntityManager, 
  whitelistAll: boolean, tenantName: string, logger: Logger) 
{
  const tenant = await em.findOneOrFail(Tenant, { name: tenantName });

  const usersMap: Record<string, User> = {};
  
  const idsWithoutName = [] as string[];
  data.accounts.forEach(({ users }) => {
    users.forEach(({ userId, userName }) => {
      if (!(userId in usersMap)) {
        usersMap[userId] = new User({ name: userName === "" ? userId : userName, userId, email: "", tenant });
        if (userName === "") { idsWithoutName.push(userId); }
      }
    });
  });

  const existedUsers = await em.find(User, { userId: { $in: Object.keys(usersMap) } });
  existedUsers.forEach((u) => usersMap[u.userId] = u);

  const accounts: Account[] = [];
  const userAccounts: UserAccount[] = [];
  data.accounts.forEach((a) => {
    const account = new Account({
      accountName: a.accountName, comment: "", blocked: false,
      tenant,
    });
    accounts.push(account);
    
    if (whitelistAll) {
      logger.info("Add %s to whitelist", a.accountName);
      const whitelist = new AccountWhitelist({
        account,
        comment: "initial",
        operatorId: "",
      });
      account.whitelist = toRef(whitelist);
      em.persist(whitelist);
    }

    a.users.forEach((u) => {
      const state = u.state;

      const user = usersMap[u.userId];
      userAccounts.push(new UserAccount({
        account,
        user,
        role: a.owner === u.userId ? UserRole.OWNER : UserRole.USER,
        status: state === "allowed!" ? UserStatus.UNBLOCKED : UserStatus.BLOCKED,
      }));
    });
  });

  await em.persistAndFlush([...Object.values(usersMap), ...accounts, ...userAccounts]);

  logger.info(
    `Import users complete. ${accounts.length} accounts, ${Object.keys(usersMap).length - existedUsers.length} users.`);
  if (idsWithoutName.length !== 0) {
    logger.warn(`${idsWithoutName.length} users don't have names.`);
    logger.warn(idsWithoutName.join(", "));
  }

  return {
    accountCount: accounts.length,
    userCount: Object.keys(usersMap).length - existedUsers.length,
    usersWithoutName: idsWithoutName.length,
  };
}
