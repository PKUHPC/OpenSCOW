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

import { Loaded } from "@mikro-orm/core";
import { platformRoleFromJSON, PlatformUserInfo } from "@scow/protos/build/server/user";
import { PlatformRole, User } from "src/entities/User";
import { UserStatus } from "src/entities/UserAccount";

import { paginationProps } from "./orm";

// generate platform role query
export const generateRoleQuery = (idOrName: string | undefined, role: PlatformRole) => {
  const baseQuery = {
    platformRoles: { $like: `%${role}%` },
  };

  if (idOrName) {
    return {
      $and: [
        {
          $or: [
            { userId: { $like: `%${idOrName}%` } },
            { name: { $like: `%${idOrName}%` } },
          ],
        },
        baseQuery,
      ],
    };
  } else {
    return baseQuery;
  }
};

// generate query options of all users
// with options: paginationProps, orderBy
export const generateAllUserQueryOptions = (
  page: number,
  pageSize?: number,
  sortField?: string,
  sortOrder?: string) => {
  return {
    ...paginationProps(page, pageSize || 10),
    orderBy: (sortField && sortOrder) ? { [sortField]: sortOrder === "ascend" ? "ASC" : "DESC" } : undefined,
  };
};

// map platform users info details from User entity with "tenant" | "accounts" | "accounts.account" relations
export const mapToPlatformUserInfoList =
  (users: Loaded<User, "tenant" | "accounts" | "accounts.account">[]): PlatformUserInfo[] => {
    return users.map((x) => ({
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
    }));
  };
