import { Logger } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { GetClusterUsersReply } from "src/generated/server/admin";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { toRef } from "src/utils/orm";

export async function importUsers(data: GetClusterUsersReply, em: SqlEntityManager, 
  whitelistAll: boolean, logger: Logger) 
{
  const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

  const usersMap: Record<string, User> = {};
  
  const idsWithoutName = [] as string[];
  data.users.forEach(({ userId, userName }) => {
    usersMap[userId] = new User({ name: userName === "" ? userId : userName, userId, email: "", tenant });
    if (userName === "") { idsWithoutName.push(userId); }
  });


  const accounts: Account[] = [];
  const userAccounts: UserAccount[] = [];
  data.accounts.forEach(async (a) => {
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
      if (!user) {
        throw <ServiceError> {
          code: Status.INVALID_ARGUMENT, message: `Account user ${u.userId} is not in users which will be imported.`,
        };
      }
      userAccounts.push(new UserAccount({
        account,
        user,
        role: a.owner === u.userId ? UserRole.OWNER : UserRole.USER,
        status: state === "allowed!" ? UserStatus.UNBLOCKED : UserStatus.BLOCKED,
      }));
    });
  });

  await em.persistAndFlush([...Object.values(usersMap), ...accounts, ...userAccounts]);

  logger.info(`Import users complete. ${accounts.length} accounts, ${Object.keys(usersMap).length} users.`);
  if (idsWithoutName.length !== 0) {
    logger.warn(`${idsWithoutName.length} users don't have names.`);
    logger.warn(idsWithoutName.join(", "));
  }

  return {
    accountCount: accounts.length,
    userCount: Object.keys(usersMap).length,
    usersWithoutName: idsWithoutName.length,
  };
}
