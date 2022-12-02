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

import { ServiceError, status } from "@grpc/grpc-js";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { PlatformRole, TenantRole, User } from "src/entities/User";

import { DEFAULT_TENANT_NAME } from "./constants";

export async function setAsInitAdmin(userId: string, em: SqlEntityManager<MySqlDriver>) {
  const user = await em.findOne(User, {
    userId: userId,
    tenant: { name: DEFAULT_TENANT_NAME },
  });
  
  if (!user) {
    throw <ServiceError> {
      code: status.NOT_FOUND,
      message: `User ${userId} is not found in default tenant.`,
    };
  }
  
  if (!user.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)) {
    user.platformRoles.push(PlatformRole.PLATFORM_ADMIN);
  }
  
  if (!user.tenantRoles.includes(TenantRole.TENANT_ADMIN)) {
    user.tenantRoles.push(TenantRole.TENANT_ADMIN);
  }
  
  await em.flush();
  
  return [{}];
}