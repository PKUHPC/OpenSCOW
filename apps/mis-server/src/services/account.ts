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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { LockMode, UniqueConstraintViolationException } from "@mikro-orm/core";
import { createAccount } from "@scow/lib-auth";
import { Decimal, decimalToMoney, moneyToNumber } from "@scow/lib-decimal";
import { AccountServiceServer, AccountServiceService,
  BlockAccountResponse_Result } from "@scow/protos/build/server/account";
import { blockAccount, unblockAccount } from "src/bl/block";
import { authUrl } from "src/config";
import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole as EntityUserRole, UserStatus } from "src/entities/UserAccount";
import { callHook } from "src/plugins/hookClient";
import { toRef } from "src/utils/orm";

export const accountServiceServer = plugin((server) => {

  server.addService<AccountServiceServer>(AccountServiceService, {
    blockAccount: async ({ request, em, logger }) => {
      const { accountName } = request;

      return await em.transactional(async (em) => {
        const account = await em.findOne(Account, {
          accountName,
        }, { lockMode: LockMode.PESSIMISTIC_WRITE, populate: ["tenant"]});

        if (!account) {
          throw <ServiceError>{
            code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
          };
        }

        const jobs = await server.ext.clusters.callOnAll(
          logger,
          async (client) => {
            const fields = [
              "job_id", "user", "state", "account",
            ];

            return await asyncClientCall(client.job, "getJobs", {
              fields,
              filter: { users: [], accounts: [accountName], states: ["RUNNING", "PENDING"]},
            });
          },
        );

        if (jobs.filter((i) => i.result.jobs.length > 0).length > 0) {
          throw <ServiceError>{
            code: Status.FAILED_PRECONDITION,
            message: `Account ${accountName}  has jobs running and cannot be blocked. `,
          };
        }

        const result = await blockAccount(account, server.ext.clusters, logger);

        if (result === "AlreadyBlocked") {
          throw <ServiceError>{
            code: Status.FAILED_PRECONDITION,
            message: `Account ${accountName} has been blocked. `,
          };
        }

        if (result === "Whitelisted") {
          throw <ServiceError>{
            code: Status.FAILED_PRECONDITION,
            message: `The account ${accountName} has been added to the whitelist. `,
          };
        }

        return [{ result: BlockAccountResponse_Result.OK }];
      });
    },

    unblockAccount: async ({ request, em, logger }) => {
      const { accountName } = request;

      return await em.transactional(async (em) => {
        const account = await em.findOne(Account, {
          accountName,
        }, { lockMode: LockMode.PESSIMISTIC_WRITE, populate: [ "tenant"]});

        if (!account) {
          throw <ServiceError>{
            code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
          };
        }

        if (!account.blocked) {
          throw <ServiceError>{
            code: Status.FAILED_PRECONDITION, message: `Account ${accountName} is unblocked`,
          };
        }

        const blockThresholdAmount =
        account.blockThresholdAmount ?? account.tenant.$.defaultAccountBlockThreshold;

        if (account.balance.lte(blockThresholdAmount)) {
          throw <ServiceError>{
            code: Status.FAILED_PRECONDITION,
            message: `The account ${accountName} balance is insufficient, please pay or add to the whitelist`,
          };
        }

        await unblockAccount(account, server.ext.clusters, logger);

        return [{ executed: true }];

      });
    },

    getAccounts: async ({ request, em }) => {

      const { accountName, tenantName } = request;

      const results = await em.find(Account, {
        ...tenantName !== undefined ? { tenant: { name: tenantName } } : undefined,
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
            blocked: Boolean(x.blocked),
            ownerId: ownerUser.userId,
            ownerName: ownerUser.name,
            comment: x.comment,
            balance: decimalToMoney(x.balance),
            blockThresholdAmount: x.blockThresholdAmount
              ? decimalToMoney(x.blockThresholdAmount)
              : undefined,
            defaultBlockThresholdAmount: decimalToMoney(x.tenant.$.defaultAccountBlockThreshold),
          };
        }),
      }];
    },

    createAccount: async ({ request, em, logger }) => {
      const { accountName, tenantName, ownerId, comment } = request;
      const user = await em.findOne(User, { userId: ownerId, tenant: { name: tenantName } });

      if (!user) {
        throw <ServiceError> {
          code: Status.NOT_FOUND, message: `User ${user} under tenant ${tenantName} does not exist`,
        };
      }

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (!tenant) {
        throw <ServiceError> {
          code: Status.NOT_FOUND, message: `Tenant ${tenantName} is not found`,
        };
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
            code: Status.ALREADY_EXISTS, message: `Account ${accountName} already exists.`,
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
        logger,
        async (client) => {
          await asyncClientCall(client.account, "createAccount", {
            accountName, ownerUserId: ownerId,
          });

          await asyncClientCall(client.account, "blockAccount", {
            accountName,
          }).catch((e) => {
            if (e.code === Status.NOT_FOUND) {
              throw <ServiceError>{
                code: Status.INTERNAL, message: `Account ${accountName} hasn't been created. block failed`,
              };
            } else {
              throw e;
            }
          });

        },
      ).catch(async (e) => {
        await rollback(e);
        throw e;
      });

      logger.info("Account has been created in cluster.");

      await callHook("accountCreated", { accountName, comment, ownerId, tenantName }, logger);

      if (server.ext.capabilities.accountUserRelation) {
        await createAccount(authUrl, { accountName, ownerUserId: ownerId }, logger);
      }

      return [{}];
    },

    getWhitelistedAccounts: async ({ request, em }) => {

      const { tenantName } = request;

      const results = await em.find(AccountWhitelist, { account: { tenant: { name: tenantName } } }, {
        populate: ["account"],
      });

      const owners = await em.find(UserAccount, {
        account: { accountName: results.map((x) => x.account.$.accountName), tenant: { name: tenantName } },
        role: EntityUserRole.OWNER,
      }, { populate: ["user"]});

      return [{
        accounts: results.map((x) => {

          const accountOwner = owners.find((o) => o.account.id === x.account.id)!.user.$;

          return {
            accountName: x.account.$.accountName,
            comment: x.comment,
            operatorId: x.operatorId,
            addTime: x.time.toISOString(),
            ownerId: accountOwner.userId + "",
            ownerName: accountOwner.name,
            balance: decimalToMoney(x.account.$.balance),
          };

        }),
      }];
    },

    whitelistAccount: async ({ request, em, logger }) => {
      const { accountName, comment, operatorId, tenantName } = request;

      const account = await em.findOne(Account, { accountName, tenant: { name: tenantName } },
        { populate: [ "tenant"]});

      if (!account) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
        };
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

      await unblockAccount(account, server.ext.clusters, logger);
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

      const account = await em.findOne(Account, { accountName, tenant: { name: tenantName } }, { populate: ["tenant"]});

      if (!account) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
        };
      }

      if (!account.whitelist) {
        return [{ executed: false }];
      }

      em.remove(account.whitelist);
      account.whitelist = undefined;

      logger.info("Remove account %s from whitelist",
        accountName,
      );

      const blockThresholdAmount =
      account.blockThresholdAmount ?? account.tenant.$.defaultAccountBlockThreshold;

      if (account.balance.isLessThanOrEqualTo(blockThresholdAmount)) {
        logger.info("Account %s is out of balance and not whitelisted. Block the account.", account.accountName);
        await blockAccount(account, server.ext.clusters, logger);
      }

      await em.flush();

      return [{ executed: true }];
    },

    setBlockThreshold: async ({ request, em }) => {
      const { accountName, blockThresholdAmount } = request;

      const account = await em.findOne(Account, { accountName }, {
        populate: ["tenant"],
      });

      if (!account) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
        };
      }
      account.blockThresholdAmount = blockThresholdAmount
        ? new Decimal(moneyToNumber(blockThresholdAmount))
        : undefined;

      await em.persistAndFlush(account);

      return [{}];
    },
  });

});
