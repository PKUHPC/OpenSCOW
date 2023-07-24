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

import { platformRoleFromJSON } from "@scow/protos/build/server/user";
import { PlatformRole } from "src/entities/User";
import { UserStatus } from "src/entities/UserAccount";

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

// set platform users detail from db
export const setPlatformUsers = (users) => {
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
