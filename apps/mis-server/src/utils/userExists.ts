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
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { getCapabilities, getUser } from "@scow/lib-auth";
import { misConfig } from "src/config/mis";
import { User } from "src/entities/User";

export async function userExists(userId: string, logger: Logger, em: SqlEntityManager<MySqlDriver>) {
  const capabilities = await getCapabilities(misConfig.authUrl);
  // Check whether the user already exists in scow
  const user = await em.findOne(User, { userId });
  if (!capabilities.getUser) {
    // 如果不支持查询，则直接返回existsInAuth: undefined
    return {
      existsInScow: !!user,
      existsInAuth: undefined,
    };
  }
  const userInfo = await getUser(misConfig.authUrl, { identityId: userId }, logger);
  return {
    existsInScow: !!user,
    existsInAuth: !!userInfo,
  };
}
