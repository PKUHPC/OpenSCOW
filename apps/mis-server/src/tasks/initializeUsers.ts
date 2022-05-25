import { Logger } from "@ddadaal/tsgrpc-server";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { getConfigFromFile } from "@scow/config";
import { Type } from "@sinclair/typebox";
import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { toRef } from "src/utils/orm";

const UsersJsonSchema = Type.Object({
  accounts: Type.Record(
    Type.String({ description: "账户名" }),
    Type.Record(
      Type.String({ description: "用户ID" }),
      Type.String({ description: "allowed!,blocked!,owner" }),
    ),
  ),
  names: Type.Record(
    Type.String({ description: "用户ID" }),
    Type.String({ description: "对应用户姓名" }),
  ),
});

export async function initializeUsers(em: SqlEntityManager, whitelistAll = false, logger: Logger,
  configBasePath?: string) {

  const data = getConfigFromFile(UsersJsonSchema, "users", false, configBasePath);

  // create default tenant
  const tenant = new Tenant({ name: DEFAULT_TENANT_NAME });
  em.persist(tenant);

  // create users from names
  const usersMap: Record<string, User> = {};

  Object.entries(data.names).forEach(([userId, name]) => {
    usersMap[userId] = new User({ name, userId, email: "", tenant });
  });

  const idsWithoutName = [] as string[];

  // create accounts and relations
  const accounts: Account[] = [];
  const userAccounts: UserAccount[] = [];
  for (const accountName in data.accounts) {
    const account = new Account({
      accountName, comment: "", blocked: false,
      tenant,
    });
    accounts.push(account);

    if (whitelistAll) {
      logger.info("Add %s to whitelist", accountName);
      const whitelist = new AccountWhitelist({
        account,
        comment: "initial",
        operatorId: "",
      });
      account.whitelist = toRef(whitelist);
      em.persist(whitelist);
    }

    for (const userId in data.accounts[accountName]) {
      const status = data.accounts[accountName][userId];

      let user = usersMap[userId];
      if (!user) {
        user = new User({ name: userId, userId, email: "", tenant });
        idsWithoutName.push(userId);
        usersMap[userId] = user;
      }

      userAccounts.push(new UserAccount({
        account,
        user,
        role: status.includes("owner") ? UserRole.OWNER : UserRole.USER,
        status: status.includes("allowed!") ? UserStatus.UNBLOCKED : UserStatus.BLOCKED,
      }));
    }
  }

  await em.persistAndFlush([...Object.values(usersMap), ...accounts, ...userAccounts]);

  logger.info(`User initialization success. ${accounts.length} accounts, ${Object.keys(usersMap).length} users.`);
  if (idsWithoutName.length !== 0) {
    logger.warn(`${idsWithoutName.length} users don't have names.`);
    logger.warn(idsWithoutName.join(", "));
  }
}


