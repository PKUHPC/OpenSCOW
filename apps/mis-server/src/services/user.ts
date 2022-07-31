import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { decimalToMoney } from "@scow/lib-decimal";
import { clusters } from "src/config/clusters";
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { StorageQuota } from "src/entities/StorageQuota";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import {
  AccountStatus,
  GetAccountUsersReply,
  platformRoleFromJSON,
  QueryIsUserInAccountReply,
  tenantRoleFromJSON,
  UserRole as PFUserRole,  UserServiceServer,
  UserServiceService,
  UserStatus as PFUserStatus } from "src/generated/server/user";
import { fetch } from "undici";

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
          code: Status.NOT_FOUND,
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
          code: Status.NOT_FOUND,
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
        };
      }

      if (account.users.getItems().some((x) => x.user.getEntity().userId === userId)) {
        throw <ServiceError>{
          code: Status.ALREADY_EXISTS,
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
          code: Status.NOT_FOUND,
        };
      }

      if (userAccount.role === UserRole.OWNER) {
        throw <ServiceError>{
          code: Status.OUT_OF_RANGE,
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
          code: Status.NOT_FOUND,
        };
      }

      if (user.status === UserStatus.BLOCKED) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION,
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
          code: Status.NOT_FOUND,
        };
      }

      if (user.status === UserStatus.UNBLOCKED) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION,
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
          code: Status.NOT_FOUND,
        };
      }

      if (user.role === UserRole.ADMIN) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION,
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
          code: Status.NOT_FOUND,
        };
      }

      if (user.role === UserRole.USER) {
        throw <ServiceError> {
          code: Status.FAILED_PRECONDITION,
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
          throw <ServiceError> { code: Status.ALREADY_EXISTS };
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

      if (!rep.ok) {
        await em.removeAndFlush(user);

        if (rep.status === 409) {
          throw <ServiceError> { code: Status.ALREADY_EXISTS };
        }

        logger.info("Error creating user in auth. code: %d, body: %o", rep.status, await rep.text());

        throw <ServiceError> { code: Status.INTERNAL, message: "Error creating user in auth" };
      }

      return [{ id: user.id }];
    },

    deleteUser: async ({ request, em }) => {
      const { userId, tenantName } = request;

      const user = await em.findOne(User, { userId, tenant: { name: tenantName } });
      if (!user) {
        throw <ServiceError>{ code: Status.NOT_FOUND };
      }

      // find if the user is an owner of any account
      const accountUser = await em.findOne(UserAccount, {
        user,
        role: UserRole.OWNER,
      });

      if (accountUser) {
        throw <ServiceError>{
          code: Status.FAILED_PRECONDITION,
          details: "User is an owner of an account.",
        };
      }

      await em.removeAndFlush(user);
      return [{}];
    },

    getName: async ({ request, em }) => {
      const { userId, tenantName } = request;

      const user = await em.findOne(User, { userId, tenant: { name: tenantName } }, { fields: ["name"]});

      if (!user) {
        throw <ServiceError> { code: Status.NOT_FOUND };
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
        throw <ServiceError>{ code: Status.NOT_FOUND };
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

  });

});
