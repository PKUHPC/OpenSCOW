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

import { Logger } from "@ddadaal/tsgrpc-server";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { UserRole } from "@scow/protos/build/server/user";
import { UserAccount } from "src/entities/UserAccount";

export async function getAccountOwnerAndAdmin(
  accountName: string,
  logger: Logger,
  em: SqlEntityManager) {

  const accountUsers = await em.find(UserAccount, { account: { accountName } }, { populate: ["user"]});

  return accountUsers.filter((x) => UserRole[x.role] !== UserRole.USER).map((x) => {
    return {
      userId: x.user.$.userId,
      name: x.user.$.name,
    };
  });

}
