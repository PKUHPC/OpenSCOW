import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { decimalToMoney } from "@scow/lib-decimal";
import { userSshFirstLogin } from "@scow/lib-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { StorageQuota } from "src/entities/StorageQuota";
import { Tenant } from "src/entities/Tenant";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import {
  AccountStatus,
  GetAccountUsersReply,
  platformRoleFromJSON,
  platformRoleToJSON,
  QueryIsUserInAccountReply,
  tenantRoleFromJSON,
  tenantRoleToJSON,
  UserRole as PFUserRole, UserServiceServer,
  UserServiceService,
  UserStatus as PFUserStatus } from "src/generated/server/user";
import { paginationProps } from "src/utils/orm";

export const userServiceServer = plugin((server) => {

  server.addService<UserServiceServer>(UserServiceService, {
    getAccountUsers: async ({ request, em }) => {
      const { accountName, tenantName } = request;

      const accountUsers = await em.find(UserAccount, {
        account: { accountName, tenant: { name: tenantName } },
      }, { populate: ["user", "user.storageQuotas"]});

      return [GetAccountUsersReply.fromPartial({
        results: accountUsers.map((x) => ({
          userId: x.user.$.userId,
          name: x.user.$.name,
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

      return [QueryIsUserInAccountReply.fromPartial({
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

    queryUsedStorageQuota: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (ops) => ops.storage.queryUsedStorageQuota({
          request: { userId }, logger,
        }),
      );

      if (reply.code === "NOT_FOUND") {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId}  is not found.`,
        };
      }

      return [{
        used: reply.used,
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

      await server.ext.clusters.callOnAll(logger,
        async (ops) => ops.user.addUser({ request: { accountName, userId }, logger }),
      );

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

      await server.ext.clusters.callOnAll(logger,
        async (ops) => ops.user.removeUser({ request: { accountName, userId }, logger }),
      );

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

      await user.block(server.ext, logger);

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

      await user.unblock(server.ext, logger);

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

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (!tenant) {
        throw <ServiceError> { code: Status.NOT_FOUND, details: "Tenant is not found." };
      }
      // creat user in database
      const user = new User({ name, userId: identityId, tenant, email });

      user.storageQuotas.add(...Object.keys(clusters).map((x) => new StorageQuota({
        cluster: x,
        storageQuota: 0,
        user: user!,
      })));

      try {
        await em.persistAndFlush(user);
      } catch (e) {
        if (e instanceof UniqueConstraintViolationException) {
          throw <ServiceError> { code: Status.ALREADY_EXISTS, message:`User with id ${identityId} already exists.` };
        } else {
          throw e;
        }
      }

      // call auth
      const rep = await fetch(misConfig.authUrl + "/user", {
        method: "POST",
        body: JSON.stringify({
          identityId,
          id: user.id,
          mail: email,
          name: name,
          password,
        }),
        headers: {
          "content-type": "application/json",
        },
      });

      logger.info("Calling auth completed. %o", rep);

      // If the call of creating user of auth fails,  delete the user created in the database.
      if (!rep.ok) {
        await em.removeAndFlush(user);

        if (rep.status === 409) {
          throw <ServiceError> {
            code: Status.ALREADY_EXISTS, message:`User with id ${user.id} already exists.`,
          };
        }

        logger.info("Error creating user in auth. code: %d, body: %o", rep.status, await rep.text());

        throw <ServiceError> { code: Status.INTERNAL, message: `Error creating user ${user.id} in auth.` };
      }

      // Making an ssh Request to the login node as the user created.
      if (process.env.NODE_ENV === "production") {
        await Promise.all(Object.values(clusters).map(async ({ displayName, slurm, misIgnore }) => {
          if (misIgnore) { return; }
          const node = slurm.loginNodes[0];
          logger.info("Checking if user can login to %s by login node %s", displayName, node);

          const error = await userSshFirstLogin(node, name, password, rootKeyPair, logger).catch((e) => e);
          if (error) {
            logger.info("user %s cannot login to %s by login node %s. err: %o", name, displayName, node, error);
            throw error;
          } else {
            logger.info("user %s login to %s by login node %s", name, displayName, node);
          }
        }));
      }

      return [{ id: user.id }];
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

    getName: async ({ request, em }) => {
      const { userId, tenantName } = request;

      const user = await em.findOne(User, { userId, tenant: { name: tenantName } }, { fields: ["name"]});

      if (!user) {
        throw <ServiceError> { code: Status.NOT_FOUND, message:`User ${userId} is not found.` };
      }

      return [{ name: user.name }];
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
        createTime: x.createTime,
        tenantRoles: x.tenantRoles,
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

      const { page, pageSize } = request;

      const [users, count] = await em.findAndCount(User, {}, {
        ...paginationProps(page, pageSize || 10),
      });

      return [{
        totalCount: count,
        platformUsers: users.map((x) => ({
          userId: x.userId,
          name: x.name,
          createTime: x.createTime,
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
