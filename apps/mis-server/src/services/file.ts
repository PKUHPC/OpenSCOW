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

import { createWriterExtensions, ServiceError } from "@ddadaal/tsgrpc-common";
import { ensureNotUndefined, plugin } from "@ddadaal/tsgrpc-server";
import { status } from "@grpc/grpc-js";
import { FilterQuery, FindOptions, Loaded, QueryOrder } from "@mikro-orm/core";
import { decimalToMoney } from "@scow/lib-decimal";
import {
  ExportRequest, FileServiceServer, FileServiceService } from "@scow/protos/build/server/file";
import {
  platformRoleFromJSON,
  platformRoleToJSON, SortDirection, tenantRoleFromJSON, tenantRoleToJSON } from "@scow/protos/build/server/user";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { PayRecord } from "src/entities/PayRecord";
import { User } from "src/entities/User";
import { UserRole, UserStatus } from "src/entities/UserAccount";
import {
  getChargesSearchType,
  getChargesTargetSearchParam,
  getPaymentsTargetSearchParam,
} from "src/utils/chargesQuery";
import { mapUsersSortField } from "src/utils/queryOptions";


type ExportEvent = NonNullable<ExportRequest["exportEvent"]>;

type ExportEntityMap = {
  chargeRecord: ChargeRecord;
  payRecord: PayRecord;
  account: Account;
  user: User;
};
type ExportEntityType<T extends ExportEvent> = T extends { $case: infer K }
  ? K extends keyof ExportEntityMap
    ? ExportEntityMap[K]
    : never
  : never;

const getExportOptions = <T extends ExportEvent>(exportEvent: T) => {

  type Entity = ExportEntityType<T>;

  const exportType = exportEvent.$case;
  switch (exportType) {
  case "chargeRecord": {
    const {
      startTime,
      endTime,
      type,
      target,
    } = ensureNotUndefined(exportEvent[exportType], ["startTime", "endTime"]);
    const searchParam = getChargesTargetSearchParam(target);
    const searchType = getChargesSearchType(type);
    const query = {
      time: { $gte: startTime, $lte: endTime },
      ...searchType,
      ...searchParam,
    };

    const recordFormat = (x: Loaded<ChargeRecord, never>) => ({
      tenantName: x.tenantName,
      accountName: x.accountName,
      amount: decimalToMoney(x.amount),
      comment: x.comment,
      index: x.id,
      time: x.time.toISOString(),
      type: x.type,
    });

    return {
      entity: ChargeRecord as new () => Entity,
      query: query as FilterQuery<Entity>,
      recordFormat,
    };
  }
  case "payRecord": {
    const {
      startTime,
      endTime,
      target,
    } = ensureNotUndefined(exportEvent[exportType], ["startTime", "endTime"]);

    const searchParam = getPaymentsTargetSearchParam(target);
    const query = {
      time: { $gte: startTime, $lte: endTime },
      ...searchParam,
    };
    const options = { orderBy: { time: QueryOrder.DESC } };

    const recordFormat = (x: Loaded<PayRecord, never>) => ({
      tenantName: x.tenantName,
      accountName: x.accountName,
      amount: decimalToMoney(x.amount),
      comment: x.comment,
      index: x.id,
      ipAddress: x.ipAddress,
      time: x.time.toISOString(),
      type: x.type,
      operatorId: x.operatorId,
    });

    return {
      entity: PayRecord as new () => Entity,
      query: query as FilterQuery<Entity>,
      options: options as FindOptions<Entity>,
      recordFormat,
    };
  }
  case "account": {
    const {
      tenantName,
      accountName,
      blocked,
      debt,
    } = exportEvent[exportType];
    const query = {
      ...tenantName !== undefined ? { tenant: { name: tenantName } } : undefined,
      ...accountName !== undefined ? { accountName } : undefined,
      ...blocked ? { blocked } : undefined,
      ...debt ? { balance: { $lt:0 } } : undefined,
    };
    const options = { populate: ["users", "users.user", "tenant"] as unknown as never[] };

    const recordFormat = (x: Loaded<Account, "tenant" | "users" | "users.user">) => {

      const owner = x.users.getItems().find((x) => x.role === UserRole.OWNER);

      if (!owner) {
        throw <ServiceError>{
          code: status.INTERNAL, message: `Account ${x.accountName} does not have an owner`,
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
      };
    };
    return {
      entity: Account as new () => Entity,
      query: query as FilterQuery<Entity>,
      options: options as FindOptions<Entity>,
      recordFormat,
    };
  }
  case "user": {
    const {
      sortField,
      sortOrder,
      idOrName,
      tenantName,
      tenantRole,
      platformRole,
    } = exportEvent[exportType];

    const platformRoleQuery = platformRole !== undefined ? {
      platformRoles: { $like: `%${platformRoleToJSON(platformRole)}%` },
    } : {};

    const tenantRoleQuery = tenantRole !== undefined ? {
      tenantRoles: { $like: `%${tenantRoleToJSON(tenantRole)}%` },
    } : {};

    const tenantNameQuery = tenantName !== undefined ? {
      tenant: { name: tenantName },
    } : {};

    const idOrNameQuery = idOrName ? {
      $or: [
        { userId: { $like: `%${idOrName}%` } },
        { name: { $like: `%${idOrName}%` } },
      ],
    } : {};

    const query = {
      $and: [
        platformRoleQuery,
        tenantRoleQuery,
        tenantNameQuery,
        idOrNameQuery,
      ],
    };
    const options = {
      orderBy: (sortField !== undefined && sortOrder !== undefined) ?
        { [mapUsersSortField[sortField]]: sortOrder === SortDirection.ASC ? "ASC" : "DESC" } : undefined,
      populate: ["tenant", "accounts", "accounts.account"] as unknown as never[],
    };

    const recordFormat = (x: Loaded<User, "tenant" | "accounts" | "accounts.account">) => ({
      userId: x.userId,
      name: x.name,
      email: x.email,
      availableAccounts: x.accounts.getItems()
        .filter((ua) => ua.status === UserStatus.UNBLOCKED)
        .map((ua) => {
          return ua.account.getProperty("accountName");
        }),
      tenantName: x.tenant.$.name,
      createTime: x.createTime.toISOString(),
      tenantRoles: x.tenantRoles.map(tenantRoleFromJSON),
      platformRoles: x.platformRoles.map(platformRoleFromJSON),
    });
    return {
      entity: User as new () => Entity,
      query: query as FilterQuery<Entity>,
      options: options as FindOptions<Entity>,
      recordFormat,
    };
  }
  default:
    return {};
  }

};

export const fileServiceServer = plugin((server) => {

  server.addService<FileServiceServer>(FileServiceService, {

    export: async (call) => {
      const { em, request } = call;
      const { exportEvent, count } = ensureNotUndefined(request, ["exportEvent"]);

      const { entity, query, options, recordFormat } =
      ensureNotUndefined(getExportOptions(exportEvent), ["entity"]);
      const totalRecords = count;

      const batchSize = 5000;
      let offset = 0;

      const { writeAsync } = createWriterExtensions(call);

      while (offset < totalRecords) {
        const limit = Math.min(batchSize, totalRecords - offset);
        const records =
        ((await em.find(entity, query ?? {}, { limit, offset, ...options })).map(recordFormat ?? ((x) => x)));

        if (records.length === 0) {
          break;
        }
        for (const row of records) {
          await new Promise(async (resolve) => {
            await writeAsync({ chunk: Buffer.from(JSON.stringify(row)) });
            resolve("done");
          }).catch((e) => {
            throw <ServiceError> {
              code: status.INTERNAL,
              message: "Error when exporting file",
              details: e?.message,
            };
          });
        }
        offset += limit;
      }
    },
  });
});



