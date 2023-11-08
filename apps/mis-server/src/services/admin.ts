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
import {
  AdminServiceServer, AdminServiceService,
  ClusterAccountInfo,
  ClusterAccountInfo_ImportStatus,
} from "@scow/protos/build/server/admin";
import { updateBlockStatusInSlurm } from "src/bl/block";
import { importUsers, ImportUsersData } from "src/bl/importUsers";
import { Account } from "src/entities/Account";
import { StorageQuota } from "src/entities/StorageQuota";
import { Tenant } from "src/entities/Tenant";
import { PlatformRole, User } from "src/entities/User";
import { UserAccount, UserRole } from "src/entities/UserAccount";

export const adminServiceServer = plugin((server) => {

  server.addService<AdminServiceServer>(AdminServiceService, {
    changeStorageQuota: async ({ }) => {
      // const { cluster, mode, userId, value } = request;

      // const quota = await em.findOne(StorageQuota, {
      //   user: { userId }, cluster,
      // });

      // if (!quota) {
      //   throw <ServiceError>{
      //     code: Status.NOT_FOUND, message: `User ${userId} or cluster ${cluster} is not found`,
      //   };
      // }

      // const reply = await server.ext.clusters.callOnOne(
      //   cluster,
      //   logger,
      //   async (ops) => ops.storage.changeStorageQuota({ request: { mode, userId, value }, logger }),
      // );

      // if (reply.code === "NOT_FOUND") {
      //   throw <ServiceError> {
      //     code: Status.NOT_FOUND, message: `User ${userId} or cluster ${cluster} is not found`,
      //   };
      // }

      // if (reply.code === "INVALID_VALUE") {
      //   throw <ServiceError> {
      //     code: Status.INVALID_ARGUMENT, message: `The changed storage quota value ${value} is not valid`,
      //   };
      // }

      // quota.storageQuota = reply.currentQuota;

      // await em.flush();

      // return [{ currentQuota: quota.storageQuota }];
      return [{ currentQuota: 10 }];

    },

    queryStorageQuota: async ({ request, em }) => {
      const { cluster, userId } = request;

      const quota = await em.findOne(StorageQuota, {
        user: { userId }, cluster,
      });

      if (!quota) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId} or cluster ${cluster} is not found`,
        };
      }

      return [{ currentQuota: quota.storageQuota }];
    },

    importUsers: async ({ request, em, logger }) => {
      const { data, whitelist } = request;

      if (!data) {
        throw <ServiceError>{
          code: Status.INVALID_ARGUMENT, message: "Submitted data is empty",
        };
      }

      const ownerNotInAccount = data.accounts.find((x) => x.owner && !x.users.find((user) => user.userId === x.owner));
      if (ownerNotInAccount) {
        throw <ServiceError>{
          code: Status.INVALID_ARGUMENT,
          message: `Owner ${ownerNotInAccount.owner} is not in ${ownerNotInAccount.accountName}`,
        };
      }

      const reply = await importUsers(data as ImportUsersData, em, whitelist, server.ext.clusters, logger);

      return [reply];

    },

    getClusterUsers: async ({ request, em, logger }) => {
      const { cluster } = request;

      const result = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.account, "getAllAccountsWithUsers", {}),
      );

      const accounts: ClusterAccountInfo[] = [];

      const includedAccounts = await em.find(Account, {
        accountName: { $in: result.accounts.map((x) => x.accountName) },
      }, { populate: ["users", "users.user"]});

      const includedUserAccounts = await em.find(UserAccount, {
        account: { accountName: result.accounts.map((x) => x.accountName) },
      }, { populate: ["account", "user"]});

      result.accounts.forEach((account) => {
        const includedAccount = includedAccounts.find((x) => x.accountName === account.accountName);
        if (!includedAccount) {
          // account not existed in scow
          accounts.push({ ...account, importStatus: ClusterAccountInfo_ImportStatus.NOT_EXISTING });
        } else {
          let status: ClusterAccountInfo_ImportStatus;

          if (
            !account.users.every((user) =>
              includedUserAccounts
                .filter((x) => x.account.$.accountName === account.accountName)
                .map((x) => x.user.$.userId)
                .includes(user.userId),
            )
          ) {
            // some users in account not existed in scow
            status = ClusterAccountInfo_ImportStatus.HAS_NEW_USERS;
          } else {
            // both users and account exist in scow
            status = ClusterAccountInfo_ImportStatus.EXISTING;
          }

          account.owner = includedUserAccounts
            .find((x) => x.account.$.accountName === account.accountName && x.role === UserRole.OWNER)!.user.$.userId;

          accounts.push({ ...account, importStatus: status });
        }
      });

      const order = {
        [ClusterAccountInfo_ImportStatus.NOT_EXISTING]: 0,
        [ClusterAccountInfo_ImportStatus.HAS_NEW_USERS]: 1,
        [ClusterAccountInfo_ImportStatus.EXISTING]: 2,
      };
      accounts.sort((a, b) => {
        return order[a.importStatus] - order[b.importStatus];
      });
      return [{ accounts }];
    },

    getFetchInfo: async () => {
      return [{
        fetchStarted: server.ext.fetch.started(),
        schedule: server.ext.fetch.schedule,
        lastFetchTime: server.ext.fetch.lastFetched()?.toISOString() ?? undefined,
      }];
    },

    setFetchState: async ({ request }) => {
      const { started } = request;

      if (started) {
        server.ext.fetch.start();
      } else {
        server.ext.fetch.stop();
      }

      return [{}];
    },

    fetchJobs: async () => {
      const reply = await server.ext.fetch.fetch();

      return [reply ? reply : { newJobsCount: 0 }];
    },

    getSyncBlockStatusInfo: async () => {
      return [{
        syncStarted: server.ext.syncBlockStatus.started(),
        schedule: server.ext.syncBlockStatus.schedule,
        lastSyncTime: server.ext.syncBlockStatus.lastSyncTime()?.toISOString() ?? undefined,
      }];
    },

    setSyncBlockStatusState: async ({ request }) => {
      const { started } = request;

      if (started) {
        server.ext.syncBlockStatus.start();
      } else {
        server.ext.syncBlockStatus.stop();
      }

      return [{}];
    },

    syncBlockStatus: async () => {
      const reply = await server.ext.syncBlockStatus.sync();
      return [reply];
    },

    updateBlockStatus: async ({ em, logger }) => {
      await updateBlockStatusInSlurm(em, server.ext.clusters, logger);
      return [{}];
    },

    getAdminInfo: async ({ em }) => {
      const userCount = await em.count(User, {});
      const accountCount = await em.count(Account, {});
      const tenantCount = await em.count(Tenant, {});
      const platformAdmins = await em.find(User, { platformRoles: { $like: `%${PlatformRole.PLATFORM_ADMIN}%` } });
      const platformFinancialStaff = await em.find(User,
        { platformRoles: { $like: `%${PlatformRole.PLATFORM_FINANCE}%` } });

      return [{
        platformAdmins: platformAdmins.map((x) => ({ userId: x.userId, userName: x.name })),
        platformFinancialStaff: platformFinancialStaff.map((x) => ({ userId: x.userId, userName: x.name })),
        tenantCount,
        accountCount,
        userCount,
      }];
    },

    getStatisticInfo: async ({ request, em }) => {
      const { startTime, endTime } = request;

      const totalUser = await em.count(User, {});
      const totalAccount = await em.count(Account, {});
      const totalTenant = await em.count(Tenant, {});

      const newUser = await em.count(User, { createTime: { $gte: startTime, $lte: endTime } });
      const newAccount = await em.count(Account, { createTime: { $gte: startTime, $lte: endTime, $ne: null } });
      const newTenant = await em.count(Tenant, { createTime: { $gte: startTime, $lte: endTime } });

      return [{
        totalUser, totalAccount, totalTenant, newUser, newAccount, newTenant,
      }];
    },
  });
});
