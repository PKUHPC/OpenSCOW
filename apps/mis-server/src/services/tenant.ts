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

import { ensureNotUndefined, plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { raw, UniqueConstraintViolationException } from "@mikro-orm/core";
import { createUser } from "@scow/lib-auth";
import { Decimal, decimalToMoney, moneyToNumber } from "@scow/lib-decimal";
import { TenantServiceServer, TenantServiceService } from "@scow/protos/build/server/tenant";
import { blockAccount, unblockAccount } from "src/bl/block";
import { authUrl } from "src/config";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { TenantRole, User } from "src/entities/User";
import { UserAccount } from "src/entities/UserAccount";
import { callHook } from "src/plugins/hookClient";
import { getAccountStateInfo } from "src/utils/accountUserState";
import { createUserInDatabase, insertKeyToNewUser } from "src/utils/createUser";


export const tenantServiceServer = plugin((server) => {

  server.addService<TenantServiceServer>(TenantServiceService, {
    getTenantInfo: async ({ request, em }) => {
      const { tenantName } = request;

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (!tenant) {
        throw <ServiceError>{ code: status.NOT_FOUND, message: `Tenant ${tenantName} is not found.` };
      }
      const accountCount = await em.count(Account, { tenant });
      const userCount = await em.count(User, { tenant });
      const admins = await em.find(User, { tenant, tenantRoles: { $like: `%${TenantRole.TENANT_ADMIN}%` } }, {
        fields: ["userId", "name"],
      });
      const financialStaff = await em.find(User, { tenant, tenantRoles: { $like: `%${TenantRole.TENANT_FINANCE}%` } }, {
        fields: ["userId", "name"],
      });

      return [{
        accountCount,
        admins: admins.map((a) => ({ userId: a.userId, userName: a.name })),
        userCount,
        balance: decimalToMoney(tenant.balance),
        defaultAccountBlockThreshold: decimalToMoney(tenant.defaultAccountBlockThreshold),
        financialStaff: financialStaff.map((f) => ({ userId: f.userId, userName: f.name })),
      }];
    },

    getTenants: async ({ em }) => {
      const tenants = await em.find(Tenant, {}, { fields: ["name"]});

      return [{ names: tenants.map((x) => x.name) }];
    },

    getAllTenants: async ({ em }) => {
      const tenants = await em.find(Tenant, {});
      const userCountObjectArray: { tCount: number, tId: number }[]
        = await em.createQueryBuilder(User, "u")
          .select([raw("count(u.user_id) as tCount"), raw("u.tenant_id as tId")])
          .groupBy("u.tenant_id").execute("all");
      // 将获查询得的对象数组userCountObjectArray转换为{"tenant_id":"userCountOfTenant"}形式
      const userCount = {};
      userCountObjectArray.map((x) => {
        userCount[x.tId] = x.tCount;
      });
      const accountCountObjectArray: { tCount: number, tId: number }[]
        = await em.createQueryBuilder(Account, "a")
          .select([raw("count(a.id) as tCount"), raw("a.tenant_id as tId")])
          .groupBy("a.tenant_id").execute("all");
      // 将获查询得的对象数组accountCountObjectArray转换为{"tenant_id":"accountCountOfTenant"}形式
      const accountCount = {};
      accountCountObjectArray.map((x) => {
        accountCount[x.tId] = x.tCount;
      });
      return [
        {
          totalCount: tenants.length,
          platformTenants: tenants.map((x) => ({
            tenantId: x.id,
            tenantName: x.name,
            // 初始创建租户时，其中无账户和用户,
            userCount: userCount[`${x.id}`] ?? 0,
            accountCount: accountCount[`${x.id}`] ?? 0,
            balance: decimalToMoney(x.balance),
            createTime: x.createTime.toISOString(),
          })),
        }];
    },

    createTenant: async ({ request, em, logger }) => {
      const { tenantName, userId, userName, userEmail, userPassword } = request;

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (tenant) {
        throw <ServiceError>{
          code: Status.ALREADY_EXISTS, message: "The tenant already exists", details: "TENANT_ALREADY_EXISTS",
        };
      }
      logger.info(`start to create tenant: ${tenantName} `);
      const newTenant = new Tenant({ name: tenantName });

      return await em.transactional(async (em) => {
        // 在数据库中创建租户
        await em.persistAndFlush(newTenant).catch((e) => {
          if (e instanceof UniqueConstraintViolationException) {
            throw <ServiceError>{
              code: Status.ALREADY_EXISTS, message: "The tenant already exists", details: "TENANT_ALREADY_EXISTS",
            };
          }
          throw <ServiceError>{ code: Status.INTERNAL, message: "Error creating tenant in database." };
        });

        // 在数据库中创建user
        const user =
         await createUserInDatabase(userId, userName, userEmail, tenantName, logger, em, server.ext.clusters)
           .then(async (user) => {
             user.tenantRoles = [TenantRole.TENANT_ADMIN];
             await em.persistAndFlush(user);
             return user;
           }).catch((e) => {
             if (e.code === Status.ALREADY_EXISTS) {
               throw <ServiceError>{
                 code: Status.ALREADY_EXISTS,
                 message: `User with userId ${userId} already exists in scow.`,
                 details: "USER_ALREADY_EXISTS",
               };
             }
             throw <ServiceError>{
               code: Status.INTERNAL,
               message: `Error creating user with userId ${userId} in database.`,
             };
           });
        // call auth
        const createdInAuth = await createUser(authUrl,
          { identityId: user.userId, id: user.id, mail: user.email, name: user.name, password: userPassword },
          logger)
          .then(async () => {
            await insertKeyToNewUser(userId, userPassword, logger, server.ext.clusters)
              .catch(() => { });
            return true;
          })
          .catch(async (e) => {
            if (e.status === 409) {
              logger.warn("User exists in auth.");
              return false;
            } else {
              logger.error("Error creating user in auth.", e);
              throw <ServiceError>{
                code: Status.INTERNAL,
                message: `Error creating user with userId ${userId} in auth.`,
              };
            }
          });
        await callHook("userCreated", { tenantName, userId: user.userId }, logger);
        return [{ tenantId: newTenant.id, userId: user.id, createdInAuth: createdInAuth }];
      },
      );
    },

    setDefaultAccountBlockThreshold: async ({ request, em, logger }) => {

      const { tenantName, blockThresholdAmount } = ensureNotUndefined(request, ["blockThresholdAmount"]);
      const tenant = await em.findOne(Tenant, { name: tenantName });

      if (!tenant) {
        throw <ServiceError>{ code: status.NOT_FOUND, message: `Tenant ${tenantName} is not found.` };
      }
      tenant.defaultAccountBlockThreshold = new Decimal(moneyToNumber(blockThresholdAmount));

      // 判断租户下各账户是否使用该租户封锁阈值，使用后是否需要在集群中进行封锁
      const accounts = await em.find(Account, { tenant: tenant, blockThresholdAmount : {} }, {
        populate: ["tenant"],
      });
      if (accounts.length > 0) {
        await Promise.allSettled(accounts
          .map(async (account) => {
            // 判断设置封锁阈值后是否应该在集群中封锁
            const shouldBlockInCluster = getAccountStateInfo(
              account.whitelist?.id,
              account.state,
              account.balance,
              new Decimal(moneyToNumber(blockThresholdAmount)),
            ).shouldBlockInCluster;

            if (shouldBlockInCluster) {
              logger.info("Account %s may be out of balance when using default tenant block threshold amount. "
              + "Block the account.", account.accountName);
              await blockAccount(account, server.ext.clusters, logger);
            }

            if (!shouldBlockInCluster) {
              logger.info("The balance of Account %s is greater than the default tenant block threshold amount. "
              + "Unblock the account.", account.accountName);
              await unblockAccount(account, server.ext.clusters, logger);
            }
          }),
        ).catch((e) => {
          logger.error("Block or unblock account failed when set a new default tenant threshold amount.", e);
        });
      }

      if (accounts.length > 0) {
        await em.persistAndFlush([...accounts, tenant]);
      } else {
        await em.persistAndFlush(tenant);
      }

      return [{}];

    },

    createTenantWithExistingUserAsAdmin: async ({ request, em }) => {

      const { tenantName, userId, userName } = request;

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (tenant) {
        throw <ServiceError>{
          code: Status.ALREADY_EXISTS, message: "The tenant already exists", details: "TENANT_ALREADY_EXISTS",
        };
      }

      const newTenant = new Tenant({ name: tenantName });


      const user = await em.findOne(User, { userId, name: userName });

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User with userId ${userId} and name ${userName} is not found.`,
        };
      }

      const userAccount = await em.findOne(UserAccount, { user: user });

      if (userAccount) {
        throw <ServiceError>{
          code: Status.FAILED_PRECONDITION, message: `User ${userId} still maintains account relationship.`,
        };
      }

      // 修改该用户的租户， 并且作为租户管理员
      em.assign(user, { tenant: newTenant });
      user.tenantRoles = [TenantRole.TENANT_ADMIN];

      await em.persistAndFlush([user, newTenant]);

      return [{
        tenantName: newTenant.name,
        adminUserId: user.userId,
      }];

    },

  });
});
