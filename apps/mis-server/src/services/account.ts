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
import { ensureNotUndefined } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { LockMode, UniqueConstraintViolationException } from "@mikro-orm/core";
import { createAccount } from "@scow/lib-auth";
import { removeUserFromAccount } from "@scow/lib-auth";
import { Decimal, decimalToMoney, moneyToNumber } from "@scow/lib-decimal";
import { mapTRPCExceptionToGRPC } from "@scow/lib-scow-resource/build/utils";
import { checkSchedulerApiVersion } from "@scow/lib-server";
import { TargetType } from "@scow/notification-protos/build/message_common_pb";
import { account_AccountStateFromJSON, AccountServiceServer, AccountServiceService,
  BlockAccountResponse_Result } from "@scow/protos/build/server/account";
import { ApiVersion } from "@scow/utils/build/version";
import { blockAccount, unblockAccount } from "src/bl/block";
import { getActivatedClusters } from "src/bl/clustersUtils";
import { authUrl } from "src/config";
import { commonConfig } from "src/config/common";
import { Account, AccountState } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { Tenant } from "src/entities/Tenant";
import { User, UserState } from "src/entities/User";
import { UserAccount, UserRole as EntityUserRole, UserStatus } from "src/entities/UserAccount";
import { InternalMessageType } from "src/models/messageType";
import { callHook } from "src/plugins/hookClient";
import { getAccountStateInfo } from "src/utils/accountUserState";
import { countSubstringOccurrences } from "src/utils/countSubstringOccurrences";
import { getAccountOwnerAndAdmin } from "src/utils/getAccountOwnerAndAdmin";
import { toRef } from "src/utils/orm";
import { unblockAccountAssignedPartitionsInCluster } from "src/utils/resourceManagement";
import { sendMessage } from "src/utils/sendMessage";

function ensureAccountNotDeleted(account: Account) {
  if (account.state === AccountState.DELETED) {
    throw {
      code: Status.NOT_FOUND,
      message: `Account ${account.accountName} has been deleted.`,
    } as ServiceError;
  }
}

export const accountServiceServer = plugin((server) => {

  server.addService<AccountServiceServer>(AccountServiceService, {
    blockAccount: async ({ request, em, logger }) => {
      const { accountName } = request;

      const result = await em.transactional(async (em) => {
        const account = await em.findOne(Account, {
          accountName,
        }, { lockMode: LockMode.PESSIMISTIC_WRITE, populate: ["tenant"]});

        if (!account) {
          throw {
            code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
          } as ServiceError;
        }

        // 检查账户是否已删除
        ensureAccountNotDeleted(account);

        const currentActivatedClusters = await getActivatedClusters(em, logger);
        const jobs = await server.ext.clusters.callOnAll(
          currentActivatedClusters,
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
          throw {
            code: Status.FAILED_PRECONDITION,
            message: `Account ${accountName}  has jobs running and cannot be blocked. `,
          } as ServiceError;
        }

        const blockThresholdAmount =
        account.blockThresholdAmount ?? account.tenant.$.defaultAccountBlockThreshold;

        const result = await blockAccount(account,
          currentActivatedClusters,
          server.ext.clusters, logger);

        if (result === "AlreadyBlocked") {

          // 如果账户已被手动冻结，提示账户已被冻结
          // 当前scow暂未使用AccountState.FROZEN
          if (account.state === AccountState.FROZEN) {
            throw {
              code: Status.FAILED_PRECONDITION,
              message: `Account ${accountName} has been frozen. `,
            } as ServiceError;
          }

          // 如果是未欠费（余额大于封锁阈值）账户，提示账户已被封锁
          if (account.balance.gt(blockThresholdAmount)) {
            throw {
              code: Status.FAILED_PRECONDITION,
              message: `Account ${accountName} has been blocked. `,
            } as ServiceError;
          }
        }

        if (result === "Whitelisted") {
          throw {
            code: Status.FAILED_PRECONDITION,
            message: `The account ${accountName} has been added to the whitelist. `,
          } as ServiceError;
        }

        // 更改数据库中状态值
        account.state = AccountState.BLOCKED_BY_ADMIN;

        return { result: BlockAccountResponse_Result.OK };
      });

      // 发送消息
      const ownerAndAdmin = await getAccountOwnerAndAdmin(accountName, logger, em);
      await sendMessage({
        messageType: InternalMessageType.AccountLocked,
        targetType: TargetType.USER, targetIds: ownerAndAdmin.map((x) => x.userId),
        metadata: {
          time: (new Date()).toISOString(),
          accountName: accountName,
        },
      }, logger);

      return [result];
    },

    unblockAccount: async ({ request, em, logger }) => {
      const { accountName } = request;

      const result = await em.transactional(async (em) => {
        const account = await em.findOne(Account, {
          accountName,
        }, { lockMode: LockMode.PESSIMISTIC_WRITE, populate: [ "tenant"]});

        if (!account) {
          throw {
            code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
          } as ServiceError;
        }

        ensureAccountNotDeleted(account);

        if (!account.blockedInCluster) {
          throw {
            code: Status.FAILED_PRECONDITION, message: `Account ${accountName} is unblocked`,
          } as ServiceError;
        }
        // 将账户从被上级封锁或冻结状态变更为正常
        account.state = AccountState.NORMAL;

        const blockThresholdAmount =
        account.blockThresholdAmount ?? account.tenant.$.defaultAccountBlockThreshold;

        // 判断解除封锁之后账户是否仍需保持封锁状态
        const shouldBlockInCluster = getAccountStateInfo(
          undefined,
          AccountState.NORMAL,
          account.balance,
          blockThresholdAmount,
        ).shouldBlockInCluster;

        // 解除账户封锁时，若为欠费账户（余额小于等于封锁阈值）则不在集群下解封账户
        if (shouldBlockInCluster) {
          logger.info(
            "Can not unblock %s in clusters because the account's balance less than or equal to the blocking threshold",
            accountName,
          );
          return { executed: true };
        }

        const currentActivatedClusters = await getActivatedClusters(em, logger);
        await unblockAccount(account, currentActivatedClusters, server.ext.clusters, logger, server.ext.resource);

        return { executed: true };
      });

      // 发送消息
      const ownerAndAdmin = await getAccountOwnerAndAdmin(accountName, logger, em);
      await sendMessage({
        messageType: InternalMessageType.AccountUnblocked,
        targetType: TargetType.USER, targetIds: ownerAndAdmin.map((x) => x.userId),
        metadata: {
          time: (new Date()).toISOString(),
          accountName: accountName,
        },
      }, logger);

      return [result];
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
            throw {
              code: Status.INTERNAL, message: `Account ${x.accountName} does not have an owner`,
            } as ServiceError;
          }

          const ownerUser = owner.user.getEntity();
          const thresholdAmount = x.blockThresholdAmount ?? x.tenant.$.defaultAccountBlockThreshold;
          const displayedAccountState =
            getAccountStateInfo(x.whitelist?.id, x.state, x.balance, thresholdAmount).displayedState;

          return {
            accountName: x.accountName,
            tenantName: x.tenant.$.name,
            userCount: x.users.count(),
            blocked: Boolean(x.blockedInCluster),
            state: account_AccountStateFromJSON(x.state),
            displayedState: displayedAccountState,
            isInWhitelist: Boolean(x.whitelist?.id),
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

      if (!user || user.state === UserState.DELETED) {
        throw {
          code: Status.NOT_FOUND,
          message: `User ${ownerId} under tenant ${tenantName} does not exist or has been deleted`,
        } as ServiceError;
      }

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (!tenant) {
        throw {
          code: Status.NOT_FOUND, message: `Tenant ${tenantName} is not found`,
        } as ServiceError;
      }

      // 新建账户时比较租户默认封锁阈值，如果租户默认封锁阈值小于0则保持账户为在集群中可用状态
      // 如果租户默认封锁阈值大于等于0，则封锁账户
      const shouldBlockInCluster: boolean = tenant.defaultAccountBlockThreshold.gte(0);

      // insert the account now to avoid future conflict
      const account = new Account({ accountName, comment, tenant, blockedInCluster: shouldBlockInCluster });

      const userAccount = new UserAccount({
        account, user, role: EntityUserRole.OWNER, blockedInCluster: UserStatus.UNBLOCKED,
      });

      try {
        await em.persistAndFlush([account, userAccount]);
      } catch (e) {
        if (e instanceof UniqueConstraintViolationException) {
          throw {
            code: Status.ALREADY_EXISTS, message: `Account ${accountName} already exists.`,
          } as ServiceError;
        }
      }

      const rollback = async (e: any) => {
        logger.info("Rollback account creation of %s", accountName);
        await em.removeAndFlush([account, userAccount]);
        throw e;
      };

      const currentActivatedClusters = await getActivatedClusters(em, logger);

      // 如果已配置资源管理扩展功能，向资源管理数据库写入账户的默认授权集群与分区
      if (commonConfig.scowResource?.enabled) {
        // 此接口建立资源管理事务且不回滚，再次创建相同账户时会正常执行
        await server.ext.resource.assignAccountOnCreate({
          accountName,
          tenantName: tenant.name,
        }).catch(async (e) => {
          await rollback(e);
          throw mapTRPCExceptionToGRPC(e);
        });
      }

      logger.info("Creating account in cluster.");
      if (shouldBlockInCluster) {
        await server.ext.clusters.callOnAll(
          currentActivatedClusters,
          logger,
          async (client) => {
            await asyncClientCall(client.account, "createAccount", {
              accountName, ownerUserId: ownerId,
            });
            await asyncClientCall(client.account, "blockAccount", {
              accountName,
            }).catch((e) => {
              if (e.code === Status.NOT_FOUND) {
                throw {
                  code: Status.INTERNAL, message: `Account ${accountName} hasn't been created. Block failed`,
                } as ServiceError;
              } else {
                throw e;
              }
            });
          },
        ).catch(async (e) => {
          await rollback(e);
          throw e;
        });
      // 如果判断为要在集群中解封时
      } else {

        // 条件1：如果配置了资源管理服务，则调用适配器的 unblockAccountWithPartitions 接口
        if (commonConfig.scowResource?.enabled) {
          await Promise.allSettled(Object.entries(currentActivatedClusters).map(async ([clusterId, cluster]) => {

            await server.ext.clusters.callOnOne(
              clusterId,
              logger,
              async (client) => {
                await asyncClientCall(client.account, "createAccount", {
                  accountName, ownerUserId: ownerId,
                });
              },
            );

            // 当前AI集群只能使用AI适配器且不支持分区概念，一旦判断为AI集群只调用原有 unblockAccount 接口
            // 上述情况以外，如果是HPC集群，调用unblockAccountAssignedPartitionsInCluster
            if (cluster.ai.enabled) {
              await server.ext.clusters.callOnOne(
                clusterId,
                logger,
                async (client) => {
                  await asyncClientCall(client.account, "unblockAccount", {
                    accountName: account.accountName,
                  });
                },
              );

            } else if (cluster.hpc.enabled) {
              await unblockAccountAssignedPartitionsInCluster(
                account.accountName,
                account.tenant.getProperty("name"),
                clusterId,
                server.ext.clusters,
                logger,
                server.ext.resource,
              );
            }

          }));
        // 条件2：如果没有配置资源管理服务，则调用适配器的 unblockAccount接口进行解封
        } else {
          await server.ext.clusters.callOnAll(
            currentActivatedClusters,
            logger,
            async (client) => {
              await asyncClientCall(client.account, "createAccount", {
                accountName, ownerUserId: ownerId,
              });
              await asyncClientCall(client.account, "unblockAccount", {
                accountName,
              }).catch((e) => {
                if (e.code === Status.NOT_FOUND) {
                  throw {
                    code: Status.INTERNAL, message: `Account ${accountName} hasn't been created. Unblock failed`,
                  } as ServiceError;
                } else {
                  throw e;
                }
              });
            },
          ).catch(async (e) => {
            await rollback(e);
            throw e;
          });
        }
      }

      logger.info("Account has been created in cluster.");

      await callHook("accountCreated", { accountName, comment, ownerId, tenantName }, logger);

      if (server.ext.capabilities.accountUserRelation) {
        await createAccount(authUrl, { accountName, ownerUserId: ownerId }, logger);
      }

      return [{}];
    },

    getWhitelistedAccounts: async ({ request, em }) => {

      const { tenantName } = request;

      // 删除过期的白名单账户
      const today = new Date();

      // 查询所有相关信息，并删除过期的白名单账户
      const results = await em.find(AccountWhitelist, {
        $and: [
          { account: { tenant: { name: tenantName } } },
        ],
      }, {
        populate: ["account"],
      });

      // 删除过期的白名单账户
      const expiredWhitelists = results.filter((x) => x.expirationTime && x.expirationTime < today);
      if (expiredWhitelists.length > 0) {
        await em.removeAndFlush(expiredWhitelists);
      }

      const owners = await em.find(UserAccount, {
        account: { accountName: results.map((x) => x.account.$.accountName), tenant: { name: tenantName } },
        role: EntityUserRole.OWNER,
      }, { populate: ["user"]});

      // 过滤结果，排除已删除的白名单账户
      const validResults = results.filter((x) => !expiredWhitelists.includes(x));

      return [{
        accounts: validResults.map((x) => {

          const accountOwner = owners.find((o) => o.account.id === x.account.id)!.user.$;
          return {
            accountName: x.account.$.accountName,
            comment: x.comment,
            operatorId: x.operatorId,
            addTime: x.time.toISOString(),
            ownerId: accountOwner.userId + "",
            ownerName: accountOwner.name,
            balance: decimalToMoney(x.account.$.balance),
            expirationTime:x.expirationTime?.toISOString().includes("2099") ? undefined
              : x.expirationTime?.toISOString(),
          };

        }),
      }];
    },

    whitelistAccount: async ({ request, em, logger }) => {
      const { accountName, comment, operatorId, tenantName, expirationTime } = request;

      const account = await em.findOne(Account, { accountName, tenant: { name: tenantName } },
        { populate: [ "tenant"]});

      if (!account) {
        throw {
          code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
        } as ServiceError;
      }

      ensureAccountNotDeleted(account);

      if (account.whitelist) {
        return [{ executed: false }];
      }

      const whitelist = new AccountWhitelist({
        account,
        time: new Date(),
        comment,
        operatorId,
        // expirationTime为undefined时为永久有效
        expirationTime:expirationTime ? new Date(expirationTime) : undefined,
      });
      account.whitelist = toRef(whitelist);

      // 如果移入白名单之前账户状态为冻结，则冻结状态优先级高于白名单，账户在集群中仍为封锁状态，state值不变
      if (account.state === AccountState.FROZEN) {
        logger.info("Add account %s to whitelist by %s with comment %s, but the account is still frozen",
          accountName,
          operatorId,
          comment,
        );
      // 如果移入白名单之前账户状态不为冻结，则账户状态变更为正常，账户在集群中为解封状态
      } else {
        if (account.state !== AccountState.NORMAL) {
          // 发送账户解封消息
          const ownerAndAdmin = await getAccountOwnerAndAdmin(accountName, logger, em);
          await sendMessage({
            messageType: InternalMessageType.AccountUnblocked,
            targetType: TargetType.USER, targetIds: ownerAndAdmin.map((x) => x.userId),
            metadata: {
              time: (new Date()).toISOString(),
              accountName: accountName,
            },
          }, logger);
        }
        account.state = AccountState.NORMAL;
        const currentActivatedClusters = await getActivatedClusters(em, logger);
        await unblockAccount(account, currentActivatedClusters, server.ext.clusters, logger);
      }

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
        throw {
          code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
        } as ServiceError;
      }

      ensureAccountNotDeleted(account);

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

      // 判断移出白名单后是否应在集群中封锁
      const shouldBlockInCluster = getAccountStateInfo(
        undefined,
        account.state,
        account.balance,
        blockThresholdAmount,
      ).shouldBlockInCluster;

      if (shouldBlockInCluster) {
        logger.info("Account %s is out of balance and not whitelisted. Block the account.", account.accountName);
        const currentActivatedClusters = await getActivatedClusters(em, logger);
        await blockAccount(account, currentActivatedClusters, server.ext.clusters, logger);
      }

      await em.flush();

      return [{ executed: true }];
    },

    setBlockThreshold: async ({ request, em, logger }) => {
      const { accountName, blockThresholdAmount } = request;

      const account = await em.findOne(Account, { accountName }, {
        populate: ["tenant"],
      });

      if (!account) {
        throw {
          code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
        } as ServiceError;
      }

      ensureAccountNotDeleted(account);

      account.blockThresholdAmount = blockThresholdAmount
        ? new Decimal(moneyToNumber(blockThresholdAmount))
        : undefined;

      const ownerAndAdmin = await getAccountOwnerAndAdmin(account.accountName, logger, em);
      if (account.balance.lt(account.blockThresholdAmount ?? 0)) {
        await sendMessage({
          messageType: InternalMessageType.AccountOverdue,
          targetType: TargetType.USER, targetIds: ownerAndAdmin.map((x) => x.userId),
          metadata: {
            time: (new Date()).toISOString(),
            accountName: account.accountName,
            amount: account.balance.minus(account.blockThresholdAmount ?? 0).abs().toString(),
          },
        }, logger);
      }

      const currentBlockThreshold = blockThresholdAmount ?
        new Decimal(moneyToNumber(blockThresholdAmount)) :
        account.tenant.getProperty("defaultAccountBlockThreshold");

      // 判断设置封锁阈值后是否应该在集群中封锁
      const shouldBlockInCluster = getAccountStateInfo(
        account.whitelist?.id,
        account.state,
        account.balance,
        currentBlockThreshold,
      ).shouldBlockInCluster;

      const currentActivatedClusters = await getActivatedClusters(em, logger);

      if (shouldBlockInCluster) {
        logger.info("Account %s may be out of balance. Block the account.", account.accountName);
        await blockAccount(account, currentActivatedClusters, server.ext.clusters, logger);
      }

      if (!shouldBlockInCluster) {
        logger.info("The balance of Account %s is greater than the block threshold amount. "
        + "Unblock the account.", account.accountName);
        await unblockAccount(account, currentActivatedClusters, server.ext.clusters, logger);
      }

      // 判断移除白名单后是否时欠费状态，如果是则发送账户欠费通知
      if (account.balance.lt(account.blockThresholdAmount ?? 0)) {
        await sendMessage({
          messageType: InternalMessageType.AccountOverdue,
          targetType: TargetType.USER, targetIds: ownerAndAdmin.map((x) => x.userId),
          metadata: {
            time: (new Date()).toISOString(),
            accountName: account.accountName,
            amount: account.balance.minus(account.blockThresholdAmount ?? 0).abs().toString(),
          },
        }, logger);
      }

      await em.persistAndFlush(account);

      return [{}];
    },

    deleteAccount: async ({ request, em, logger }) => {
      const { accountName, tenantName, comment } = ensureNotUndefined(request, ["accountName", "tenantName"]);

      const tenant = await em.findOne(Tenant, { name: tenantName });

      if (!tenant) {
        throw { code: Status.NOT_FOUND, message: `Tenant ${tenantName} is not found.` } as ServiceError;
      }

      const account = await em.findOne(Account, { accountName,
        tenant: { name: tenantName } }, { populate: ["tenant","users","users.user"]});

      if (!account) {
        throw {
          code: Status.NOT_FOUND, message: `Account ${accountName} is not found`,
        } as ServiceError;
      }

      ensureAccountNotDeleted(account);

      const userAccounts = account.users.getItems();
      const currentActivatedClusters = await getActivatedClusters(em, logger);
      // 查询账户是否有RUNNING、PENDING的作业与交互式应用，有则抛出异常
      const runningJobs = await server.ext.clusters.callOnAll(
        currentActivatedClusters,
        logger,
        async (client) => {
          const fields = ["job_id", "user", "state", "account"];

          return await asyncClientCall(client.job, "getJobs", {
            fields,
            filter: { users: [], accounts: [accountName], states: ["RUNNING", "PENDING"]},
          });
        },
      );

      const runningJobsObj = {
        accountName,
        type: "RUNNING_JOBS",
      };

      if (runningJobs.filter((i) => i.result.jobs.length > 0).length > 0) {
        throw {
          code: Status.FAILED_PRECONDITION,
          message: JSON.stringify(runningJobsObj),
        } as ServiceError;
      }

      // 当前接口要求的最低调度器接口版本
      const minRequiredApiVersion: ApiVersion = { major: 1, minor: 7, patch: 0 };
      await server.ext.clusters.callOnAll(currentActivatedClusters, logger, async (client) => {
        // 当前接口要求的最低调度器接口版本
        // 检查调度器的 API 版本
        await checkSchedulerApiVersion(client, minRequiredApiVersion);
      }).catch(() => {

        const details = "The method is not supported with the current scheduler adapter version. " +
          "To use this method, the scheduler adapter must be upgraded to version " +
          `${minRequiredApiVersion.major}.${minRequiredApiVersion.minor}.${minRequiredApiVersion.patch} or higher.`;

        logger.error(details, "Scheduler API version mismatch.");

        throw {
          code: Status.UNIMPLEMENTED,
          message: details,
        } as ServiceError;
      });

      // 处理用户账户关系表，删除账户与所有用户的关系
      const hasCapabilities = server.ext.capabilities.accountUserRelation;

      let ownerId;

      for (const userAccount of userAccounts) {
        const userId = userAccount.user.getEntity().userId;
        if (userAccount.role === EntityUserRole.OWNER) {
          ownerId = userId;
          continue;
        }
        await em.removeAndFlush(userAccount);
        await server.ext.clusters.callOnAll(currentActivatedClusters, logger, async (client) => {
          return await asyncClientCall(client.user, "removeUserFromAccount",
            { userId, accountName });
        }).catch(async (e) => {
          // 如果每个适配器返回的Error都是NOT_FOUND，说明所有集群均已将此用户移出账户，可以在scow数据库及认证系统中删除该条关系，
          // 除此以外，都抛出异常
          if (countSubstringOccurrences(e.details, "Error: 5 NOT_FOUND")
                   !== Object.keys(currentActivatedClusters).length) {
            throw e;
          }
        });
        if (hasCapabilities) {
          await removeUserFromAccount(authUrl, { accountName, userId }, logger);
        }
      }

      if (account.whitelist) {
        em.remove(account.whitelist);
        account.whitelist = undefined;
      }

      // 先在数据库中删除，避免适配器不能在全部集群中删除账户（如默认账户）带来的一系列问题

      account.state = AccountState.DELETED;
      account.comment = account.comment + (comment ? "  " + comment.trim() : "");
      account.blockedInCluster = true;
      await em.flush();

      await callHook("accountDeleted", { accountName, comment, ownerId, tenantName }, logger);

      await server.ext.clusters.callOnAll(currentActivatedClusters, logger, async (client) => {
        return await asyncClientCall(client.account, "deleteAccount",
          { accountName });
      }).catch(async (e) => {
        // 如果每个适配器返回的Error都是NOT_FOUND，说明所有集群均已移出账户
        // 除此以外，都抛出异常
        if (countSubstringOccurrences(e.details, "Error: 5 NOT_FOUND")
                 !== Object.keys(currentActivatedClusters).length) {
          logger.error(e, "deleteAccount Error occurred.");
          throw e;
        }
      });

      return [{}];
    },
  });

});
