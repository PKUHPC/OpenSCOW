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
import { createUser, getUser } from "@scow/lib-auth";
import { decimalToMoney } from "@scow/lib-decimal";
import {
  AccountStatus,
  GetAccountUsersResponse,
  platformRoleFromJSON,
  platformRoleToJSON,
  QueryIsUserInAccountResponse,
  tenantRoleFromJSON,
  tenantRoleToJSON,
  UserRole as PFUserRole, UserServiceServer,
  UserServiceService,
  UserStatus as PFUserStatus } from "@scow/protos/build/server/user";
import { blockUserInAccount, unblockUserInAccount } from "src/bl/block";
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { callHook } from "src/plugins/hookClient";
import { createUserInDatabase, insertKeyToNewUser } from "src/utils/createUser";
import { paginationProps } from "src/utils/orm";

export const userServiceServer = plugin((server) => {

  server.addService<UserServiceServer>(UserServiceService, {
    getAccountUsers: async ({ request, em }) => {
      const { accountName, tenantName } = request;

      const accountUsers = await em.find(UserAccount, {
        account: { accountName, tenant: { name: tenantName } },
      }, { populate: ["user", "user.storageQuotas"]});

      return [GetAccountUsersResponse.fromPartial({
        results: accountUsers.map((x) => ({
          userId: x.user.$.userId,
          name: x.user.$.name,
          email: x.user.$.email,
          role: PFUserRole[x.role],
          status: PFUserStatus[x.status],
          jobChargeLimit: x.jobChargeLimit ? decimalToMoney(x.jobChargeLimit) : undefined,
          usedJobChargeLimit: x.usedJobCharge ? decimalToMoney(x.usedJobCharge) : undefined,
          storageQuotas: x.user.$.storageQuotas.getItems().reduce((prev, curr) => {
            prev[curr.cluster] = curr.storageQuota;
            return prev;
          }, {}),
        })),
      })];
    },

    queryIsUserInAccount: async ({ request, em }) => {
      const { accountName, userId, tenantName } = request;

      const user = await em.findOne(UserAccount, {
        user: { userId, tenant: { name: tenantName } },
        account: { accountName, tenant: { name: tenantName } },
      });

      return [QueryIsUserInAccountResponse.fromPartial({
        result: user !== null,
      })];
    },

    getUserStatus: async ({ request, em }) => {
      const { userId, tenantName } = request;

      const user = await em.findOne(User, { userId, tenant: { name: tenantName } }, {
        populate: ["storageQuotas", "accounts", "accounts.account"],
      });

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId}, tenant ${tenantName} is not found`,
        };
      }

      return [{
        accountStatuses: user.accounts.getItems().reduce((prev, curr) => {
          const account = curr.account.getEntity();
          prev[account.accountName] = {
            userStatus: PFUserStatus[curr.status],
            accountBlocked: account.blocked,
            jobChargeLimit: curr.jobChargeLimit ? decimalToMoney(curr.jobChargeLimit) : undefined,
            usedJobCharge: curr.usedJobCharge ? decimalToMoney(curr.usedJobCharge) : undefined,
            balance: decimalToMoney(curr.account.getEntity().balance),
          } as AccountStatus;
          return prev;
        }, {}),
        storageQuotas: user.storageQuotas.getItems().reduce((prev, curr) => {
          prev[curr.cluster] = curr.storageQuota;
          return prev;
        }, {}),
      }];
    },

    queryUsedStorageQuota: async ({}) => {
      // const { cluster, userId } = request;

      // const reply = await server.ext.clusters.callOnOne(
      //   cluster,
      //   logger,
      //   async (ops) => ops.storage.queryUsedStorageQuota({
      //     request: { userId }, logger,
      //   }),
      // );

      // if (reply.code === "NOT_FOUND") {
      //   throw <ServiceError>{
      //     code: Status.NOT_FOUND, message: `User ${userId}  is not found.`,
      //   };
      // }

      return [{
        used: 10,
      }];
    },

    addUserToAccount: async ({ request, em, logger }) => {
      const { accountName, userId, tenantName } = request;

      const account = await em.findOne(Account, {
        accountName, tenant: { name: tenantName },
      }, { populate: ["users", "users.user", "tenant"]});

      const user = await em.findOne(User, {
        userId, tenant: { name: tenantName },
      });

      if (!account || !user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND,
          message: `Account ${accountName} or user ${userId}, tenant ${tenantName} is not found.`,
        };
      }

      if (account.users.getItems().some((x) => x.user.getEntity().userId === userId)) {
        throw <ServiceError>{
          code: Status.ALREADY_EXISTS, message: `User ${userId} already in the account ${accountName}.`,
        };
      }

      await server.ext.clusters.callOnAll(logger, async (client) => {
        return await asyncClientCall(client.user, "addUserToAccount", { userId, accountName });
      });

      const newUserAccount = new UserAccount({
        account,
        user,
        role: UserRole.USER,
        status: UserStatus.UNBLOCKED,
      });

      account.users.add(newUserAccount);

      await em.persistAndFlush([account, user, newUserAccount]);

      return [{}];
    },

    removeUserFromAccount: async ({ request, em, logger }) => {
      const { accountName, userId, tenantName } = request;

      const userAccount = await em.findOne(UserAccount, {
        user: { userId, tenant: { name: tenantName } },
        account: { accountName, tenant: { name: tenantName } },
      });

      if (!userAccount) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message:`User ${userId} or account ${accountName}  is not found.`,
        };
      }

      if (userAccount.role === UserRole.OWNER) {
        throw <ServiceError>{
          code: Status.OUT_OF_RANGE,
          message: `User ${userId} is the owner of the account ${accountName}。`,
        };
      }

      await server.ext.clusters.callOnAll(logger, async (client) => {
        return await asyncClientCall(client.user, "removeUserFromAccount", { userId, accountName });
      });

      await em.removeAndFlush(userAccount);

      return [{}];

    },

    blockUserInAccount: async ({ request, em, logger }) => {
      const { accountName, userId, tenantName } = request;

      const user = await em.findOne(UserAccount, {
        user: { userId, tenant: { name: tenantName } },
        account: { accountName, tenant: { name: tenantName } },
      }, { populate: ["user", "account"]});

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId} or account ${accountName} is not found.`,
        };
      }

      if (user.status === UserStatus.BLOCKED) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION, message: `User ${userId}  is already blocked.`,
        };
      }

      await blockUserInAccount(user, server.ext, logger);

      user.status = UserStatus.BLOCKED;

      await em.flush();

      return [{}];
    },

    unblockUserInAccount: async ({ request, em, logger }) => {
      const { accountName, userId, tenantName } = request;

      const user = await em.findOne(UserAccount, {
        user: { userId, tenant: { name: tenantName } },
        account: { accountName, tenant: { name: tenantName } },
      }, { populate: ["user", "account"]});

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message:`User ${userId} or account ${accountName}  is not found.`,
        };
      }

      if (user.status === UserStatus.UNBLOCKED) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION, message: `User ${userId}  is already unblocked.`,
        };
      }

      await unblockUserInAccount(user, server.ext, logger);

      user.status = UserStatus.UNBLOCKED;

      await em.flush();

      return [{}];
    },

    setAsAdmin: async ({ request, em }) => {
      const { accountName, userId, tenantName } = request;

      const user = await em.findOne(UserAccount, {
        user: { userId, tenant: { name: tenantName } },
        account: { accountName, tenant: { name: tenantName } },
      });

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message:`User ${userId} or account ${accountName}  is not found.`,
        };
      }

      if (user.role === UserRole.ADMIN) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION, message: `User ${userId} is already admin.`,
        };
      }

      user.role = UserRole.ADMIN;
      await em.flush();

      return [{}];
    },

    unsetAdmin: async ({ request, em }) => {
      const { accountName, userId, tenantName } = request;

      const user = await em.findOne(UserAccount, {
        user: { userId, tenant: { name: tenantName } },
        account: { accountName, tenant: { name: tenantName } },
      });

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message:`User ${userId} or account ${accountName}  is not found.`,
        };
      }

      if (user.role === UserRole.USER) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION, message: `User ${userId} is already not admin.`,
        };
      }

      user.role = UserRole.USER;
      await em.flush();

      return [{}];
    },

    createUser: async ({ request, em, logger }) => {
      const { name, tenantName, email, identityId, password } = request;
      const user = await createUserInDatabase(identityId, name, email, tenantName, server.logger, em)
        .catch((e) => {
          if (e.code === Status.ALREADY_EXISTS) {
            throw <ServiceError> {
              code: Status.ALREADY_EXISTS,
              message: `User with userId ${identityId} already exists in scow.`,
              details: "EXISTS_IN_SCOW",
            };
          }
          throw <ServiceError> {
            code: Status.INTERNAL,
            message: `Error creating user with userId ${identityId} in database.` };
        });
      // call auth
      const createdInAuth = await createUser(misConfig.authUrl,
        { identityId: user.userId, id: user.id, mail: user.email, name: user.name, password },
        server.logger)
        .then(async () => {
          // insert public key
          await insertKeyToNewUser(identityId, password, server.logger)
            .catch(() => {});
          return true;
        })
        // If the call of creating user of auth fails,  delete the user created in the database.
        .catch(async (e) => {
          if (e.status === 409) {
            server.logger.warn("User exists in auth.");
            return false;
          } else {
            // 回滚数据库
            await em.removeAndFlush(user);
            server.logger.error("Error creating user in auth.", e);
            throw <ServiceError> {
              code: Status.INTERNAL,
              message: `Error creating user with userId ${identityId} in auth.` };
          }
        });

      await callHook("userCreated", { tenantName, userId: user.userId }, logger);

      return [{
        createdInAuth: createdInAuth,
        id: user.id,
      }];
    },

    deleteUser: async ({ request, em }) => {
      const { userId, tenantName } = request;

      const user = await em.findOne(User, { userId, tenant: { name: tenantName } });
      if (!user) {
        throw <ServiceError>{ code: Status.NOT_FOUND, message:`User ${userId} is not found.` };
      }

      // find if the user is an owner of any account
      const accountUser = await em.findOne(UserAccount, {
        user,
        role: UserRole.OWNER,
      });

      if (accountUser) {
        throw <ServiceError>{
          code: Status.FAILED_PRECONDITION,
          details: `User ${userId} is an owner of an account.`,
        };
      }

      await em.removeAndFlush(user);
      return [{}];
    },

    checkUserNameMatch: async ({ request, em }) => {
      const { userId, name } = request;

      // query auth
      if (server.ext.capabilities.getUser) {
        const authUser = await getUser(misConfig.authUrl, { identityId: userId }, server.logger);

        if (!authUser) {
          throw <ServiceError> { code: Status.NOT_FOUND, message:`User ${userId} is not found from auth` };
        }

        if (authUser.name !== undefined) {
          return [{ match: authUser.name === name }];
        }
      }

      // auth doesn't support getUser or user name is not set in auth
      // check mis db
      const user = await em.findOne(User, { userId }, { fields: ["name"]});

      if (!user) {
        throw <ServiceError> { code: Status.NOT_FOUND, message:`User ${userId} is not found in mis db` };
      }

      return [{ match: user.name === name }];
    },

    getUsers: async ({ request, em }) => {
      const { tenantName } = request;

      const users = await em.find(User, { tenant: { name: tenantName } }, {
        populate: ["tenant", "accounts", "accounts.account"],
      });

      return [{ users: users.map((x) => ({
        tenantName: x.tenant.$.name,
        email: x.email,
        name: x.name,
        userId: x.userId,
        createTime: x.createTime.toISOString(),
        tenantRoles: x.tenantRoles.map(tenantRoleFromJSON),
        accountAffiliations: x.accounts.getItems().map((x) => ({
          accountName: x.account.getEntity().accountName,
          role: PFUserRole[x.role],
        })),
        platformRoles: x.platformRoles.map(platformRoleFromJSON),
      })) } ];
    },

    getUserInfo: async ({ request, em }) => {

      const { userId } = request;

      const user = await em.findOne(User, {
        userId,
      }, { populate: ["accounts", "accounts.account", "tenant"]});

      if (!user) {
        throw <ServiceError>{ code: Status.NOT_FOUND, message:`User ${userId} is not found.` };
      }

      return [{
        affiliations: user.accounts.getItems().map((x) => ({
          accountName: x.account.getEntity().accountName,
          role: PFUserRole[x.role],
        })),
        tenantName: user.tenant.$.name,
        name: user.name,
        tenantRoles: user.tenantRoles.map(tenantRoleFromJSON),
        platformRoles: user.platformRoles.map(platformRoleFromJSON),
      }];
    },

    getAllUsers: async ({ request, em }) => {

      const { page, pageSize, idOrName } = request;

      const [users, count] = await em.findAndCount(User, idOrName ? {
        $or: [
          { userId: { $like: `%${idOrName}%` } },
          { name: { $like: `%${idOrName}%` } },
        ],
      } : {}, {
        ...paginationProps(page, pageSize || 10),
        populate: ["tenant", "accounts", "accounts.account"],
      });

      return [{
        totalCount: count,
        platformUsers: users.map((x) => ({
          userId: x.userId,
          name: x.name,
          availableAccounts: x.accounts.getItems()
            .filter((ua) => ua.status === UserStatus.UNBLOCKED)
            .map((ua) => {
              return ua.account.getProperty("accountName");
            }),
          tenantName: x.tenant.$.name,
          createTime: x.createTime.toISOString(),
          platformRoles: x.platformRoles.map(platformRoleFromJSON),
        })),
      }];
    },

    setPlatformRole: async ({ request, em }) => {
      const { userId, roleType } = request;
      const dbRoleType: PlatformRole = PlatformRole[platformRoleToJSON(roleType)];

      const user = await em.findOne(User, { userId: userId });

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId} is not found.`,
        };
      }

      if (user.platformRoles.includes(dbRoleType)) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION, message: `User ${userId} is already this role.`,
        };
      }

      user.platformRoles.push(dbRoleType);
      await em.flush();

      return [{}];
    },

    unsetPlatformRole: async ({ request, em }) => {
      const { userId, roleType } = request;
      const dbRoleType: PlatformRole = PlatformRole[platformRoleToJSON(roleType)];

      const user = await em.findOne(User, { userId: userId });

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId} is not found.`,
        };
      }

      if (!user.platformRoles.includes(dbRoleType)) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION, message: `User ${userId} is already not this role.`,
        };
      }

      user.platformRoles = user.platformRoles.filter((item) =>
        item !== dbRoleType);
      await em.flush();

      return [{}];
    },

    setTenantRole: async ({ request, em }) => {
      const { userId, roleType } = request;
      const dbRoleType: TenantRole = TenantRole[tenantRoleToJSON(roleType)];

      const user = await em.findOne(User, { userId: userId });

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId} is not found.`,
        };
      }

      if (user.tenantRoles.includes(dbRoleType)) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION, message: `User ${userId} is already this role.`,
        };
      }

      user.tenantRoles.push(dbRoleType);
      await em.flush();

      return [{}];
    },

    unsetTenantRole: async ({ request, em }) => {
      const { userId, roleType } = request;
      const dbRoleType: TenantRole = TenantRole[tenantRoleToJSON(roleType)];

      const user = await em.findOne(User, { userId: userId });

      if (!user) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId} is not found.`,
        };
      }

      if (!user.tenantRoles.includes(dbRoleType)) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION, message: `User ${userId} is already not this role.`,
        };
      }

      user.tenantRoles = user.tenantRoles.filter((item) =>
        item !== dbRoleType);
      await em.flush();

      return [{}];
    },
  });
});
