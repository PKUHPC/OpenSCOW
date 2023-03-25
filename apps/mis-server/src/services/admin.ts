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

import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AdminServiceServer, AdminServiceService,
  ClusterAccountInfo_ImportStatus } from "@scow/protos/build/server/admin";
import { updateBlockStatusInSlurm } from "src/bl/block";
import { importUsers, ImportUsersData } from "src/bl/importUsers";
import { Account } from "src/entities/Account";
import { StorageQuota } from "src/entities/StorageQuota";
import { User } from "src/entities/User";
import { parseClusterUsers } from "src/utils/slurm";

export const adminServiceServer = plugin((server) => {

  server.addService<AdminServiceServer>(AdminServiceService, {
    changeStorageQuota: async ({ request, em, logger }) => {
      const { cluster, mode, userId, value } = request;

      const quota = await em.findOne(StorageQuota, {
        user: { userId }, cluster,
      });

      if (!quota) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message: `User ${userId} or cluster ${cluster} is not found`,
        };
      }

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (ops) => ops.storage.changeStorageQuota({ request: { mode, userId, value }, logger }),
      );

      if (reply.code === "NOT_FOUND") {
        throw <ServiceError> {
          code: Status.NOT_FOUND, message: `User ${userId} or cluster ${cluster} is not found`,
        };
      }

      if (reply.code === "INVALID_VALUE") {
        throw <ServiceError> {
          code: Status.INVALID_ARGUMENT, message: `The changed storage quota value ${value} is not valid`,
        };
      }

      quota.storageQuota = reply.currentQuota;

      await em.flush();

      return [{ currentQuota: quota.storageQuota }];

    },

    queryStorageQuota: async ({ request, em }) => {
      const { cluster, userId } = request;

      const quota = await em.findOne(StorageQuota, {
        user: { userId }, cluster,
      });

      if (!quota) {
        throw <ServiceError>{
          code: Status.NOT_FOUND, message:  `User ${userId} or cluster ${cluster} is not found`,
        };
      }

      return [{ currentQuota: quota.storageQuota }];
    },

    importUsers: async ({ request, em, logger }) => {
      const { data, whitelist } = request;

      if (!data) {
        throw <ServiceError> {
          code: Status.INVALID_ARGUMENT, message: "Submitted data is empty",
        };
      }

      const ownerNotInAccount = data.accounts.find((x) => x.owner && !x.users.find((user) => user.userId === x.owner));
      if (ownerNotInAccount) {
        throw <ServiceError> {
          code: Status.INVALID_ARGUMENT,
          message: `Owner ${ownerNotInAccount.owner} is not in ${ownerNotInAccount.accountName}`,
        };
      }

      const reply = await importUsers(data as ImportUsersData, em, whitelist, logger);

      return [reply];

    },

    getClusterUsers: async ({ request, em, logger }) => {
      const { cluster } = request;

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (ops) => ops.user.getAllUsersInAccounts({
          request: {}, logger,
        }),
      );

      const result = parseClusterUsers(reply.result);

      const includedAccounts = await em.find(Account, {
        accountName: { $in: result.accounts.map((x) => x.accountName) },
      });

      const allUsers = result.accounts.flatMap(
        (account) => account.users.map((user) => user.userId),
      );
      const includedUsers = await em.find(User, { userId: { $in: allUsers } });

      result.accounts.forEach((account) => {
        if (!includedAccounts.find((x) => x.accountName === account.accountName)) {
          // account not existed in scow
          account.importStatus = ClusterAccountInfo_ImportStatus.NOT_EXISTED;
        } else if (!account.users.every((user) => includedUsers.map((x) => x.userId).includes(user.userId))) {
          // some users in account not existed in scow
          account.importStatus = ClusterAccountInfo_ImportStatus.HAS_NEW_USERS;
        } else {
          // both users and account exist in scow
          account.importStatus = ClusterAccountInfo_ImportStatus.EXISTED;
        }
      });

      result.accounts.sort((a, b) => {
        const order = {
          [ClusterAccountInfo_ImportStatus.NOT_EXISTED]: 0,
          [ClusterAccountInfo_ImportStatus.HAS_NEW_USERS]: 1,
          [ClusterAccountInfo_ImportStatus.EXISTED]: 2,
        };

        return order[a.importStatus] - order[b.importStatus];
      });
      console.log(result);
      return [result];
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

      return [reply];
    },

    updateBlockStatus: async ({ em, logger }) => {
      await updateBlockStatusInSlurm(em, server.ext.clusters, logger);
      return [{}];
    },

  });
});
