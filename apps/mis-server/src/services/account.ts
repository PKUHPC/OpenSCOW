import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { LockMode, UniqueConstraintViolationException } from "@mikro-orm/core";
import { decimalToMoney } from "@scow/lib-decimal";
import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole as EntityUserRole,UserStatus } from "src/entities/UserAccount";
import { AccountServiceClient } from "src/generated/clusterops/account";
import { AccountServiceServer, AccountServiceService,
  BlockAccountReply_Result } from "src/generated/server/account";
import { toRef } from "src/utils/orm";

export const accountServiceServer = plugin((server) => {

  server.addService<AccountServiceServer>(AccountServiceService, {
    blockAccount: async ({ request, em }) => {
      const { accountName } = request;

      await em.transactional(async (em) => {
        const account = await em.findOne(Account, {
          accountName,
        }, { lockMode: LockMode.PESSIMISTIC_WRITE });

        if (!account) {
          throw <ServiceError>{ code: Status.NOT_FOUND };
        }

        if (account.blocked) {
          return [{ result: BlockAccountReply_Result.ALREADY_BLOCKED }];
        }


        await account.block(server.ext.clusters);
      });

      return [{ result: BlockAccountReply_Result.OK }];
    },

    unblockAccount: async ({ request, em }) => {
      const { accountName } = request;

      await em.transactional(async (em) => {
        const account = await em.findOne(Account, {
          accountName,
        }, { lockMode: LockMode.PESSIMISTIC_WRITE });

        if (!account) {
          throw <ServiceError>{ code: Status.NOT_FOUND };
        }

        if (!account.blocked) {
          return [{ executed: false }];
        }

        await account.unblock(server.ext.clusters);
      });

      return [{ executed: true }];
    },

    getAccounts: async ({ request, em }) => {

      const { accountName, tenantName } = request;

      const results = await em.find(Account, {
        tenant: { name: tenantName },
        ...accountName !== undefined ? { accountName } : undefined,
      }, { populate: ["users", "users.user", "tenant"]});

      return [{
        results: results.map((x) => {

          const owner = x.users.getItems().find((x) => x.role === EntityUserRole.OWNER);

          if (!owner) {
            throw <ServiceError>{
              code: Status.INTERNAL, message: `Account ${x.accountName} does not have an owner`,
            };
          }

          const ownerUser = owner.user.getEntity();

          return {
            accountName: x.accountName,
            tenantName: x.tenant.$.name,
            userCount: x.users.count(),
            blocked: x.blocked,
            ownerId: ownerUser.userId,
            ownerName: ownerUser.name,
            comment: x.comment,
            balance: decimalToMoney(x.balance),
          };
        }),
      }];
    },

    createAccount: async ({ request, em, logger }) => {
      const { accountName, tenantName, ownerId, comment } = request;
      const user = await em.findOne(User, { userId: ownerId });

      if (!user) {
        throw <ServiceError> { code: Status.NOT_FOUND };
      }

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (!tenant) {
        throw <ServiceError> { code: Status.NOT_FOUND };
      }

      // insert the account now to avoid future conflict
      const account = new Account({ accountName, comment, tenant, blocked: true });

      const userAccount = new UserAccount({
        account, user, role: EntityUserRole.OWNER, status: UserStatus.UNBLOCKED,
      });

      try {
        await em.persistAndFlush([account, userAccount]);
      } catch (e) {
        if (e instanceof UniqueConstraintViolationException) {
          throw <ServiceError>{
            code: Status.ALREADY_EXISTS,
          };
        }
      }

      const rollback = async (e: any) => {
        logger.info("Rollback account creation of %s", accountName);
        await em.removeAndFlush([account, userAccount]);
        throw e;
      };

      logger.info("Creating account in cluster.");
      await server.ext.clusters.callOnAll(
        AccountServiceClient,
        { method: "createAccount", req: { accountName, ownerId } },
        { method: "deleteAccount", req: { accountName } },
      ).catch(async (e) => {
        await rollback(e);
      });

      logger.info("Account has been created in cluster.");

      return [{}];
    },

    getWhitelistedAccounts: async ({ request, em }) => {

      const { tenantName } = request;

      const results = await em.find(AccountWhitelist, { account: { tenant: { name: tenantName } } }, {
        populate: ["account"],
      });

      const owners = await em.find(UserAccount, {
        account: { accountName: results.map((x) => x.account.$.accountName ), tenant: { name: tenantName } },
        role: EntityUserRole.OWNER,
      }, { populate: ["user"]});

      return [{
        accounts: results.map((x) => {

          const accountOwner = owners.find((o) => o.account.id === x.account.id)!.user.$;

          return {
            accountName: x.account.$.accountName,
            comment: x.comment,
            operatorId: x.operatorId,
            addTime: x.time,
            ownerId: accountOwner.id + "",
            ownerName: accountOwner.name,
          };

        }),
      }];
    },

    whitelistAccount: async ({ request, em, logger }) => {
      const { accountName, comment, operatorId, tenantName } = request;

      const account = await em.findOne(Account, { accountName, tenant: { name: tenantName } });

      if (!account) {
        throw <ServiceError>{ code: Status.NOT_FOUND };
      }

      if (account.whitelist) {
        return [{ executed: false }];
      }

      const whitelist = new AccountWhitelist({
        account,
        time: new Date(),
        comment,
        operatorId,
      });
      account.whitelist = toRef(whitelist);

      await account.unblock(server.ext.clusters);
      await em.persistAndFlush(whitelist);

      logger.info("Add account %s to whitelist by %s with comment %s",
        accountName,
        operatorId,
        comment,
      );

      return [{ executed: true }];
    },

    dewhitelistAccount: async ({ request, em, logger }) => {
      const { accountName, tenantName } = request;

      const account = await em.findOne(Account, { accountName, tenant: { name: tenantName } });

      if (!account) {
        throw <ServiceError>{ code: Status.NOT_FOUND };
      }

      if (!account.whitelist) {
        return [{ executed: false }];
      }

      em.remove(account.whitelist);
      account.whitelist = undefined;

      logger.info("Remove account %s from whitelist",
        accountName,
      );

      if (account.balance.isNegative()) {
        logger.info("Account %s is out of balance and not whitelisted. Block the account.", account.accountName);
        await account.block(server.ext.clusters);
      }

      await em.flush();

      return [{ executed: true }];
    },

  });

});
