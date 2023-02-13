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

import { SqlEntityManager } from "@mikro-orm/knex";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { TenantRole, User } from "src/entities/User";
import { UserAccount, UserRole, UserStatus } from "src/entities/UserAccount";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";

export async function insertInitialData(em: SqlEntityManager) {

  const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

  const userA = new User({ name: "AName", userId: "a", email: "a@a.com", tenant,
    tenantRoles: [TenantRole.TENANT_ADMIN]});
  const userB = new User({ name: "BName", userId: "b", email: "b@b.com", tenant });

  const accountA = new Account({ accountName: "hpca", comment: "", blocked: false, tenant });
  const accountB = new Account({ accountName: "hpcb", comment: "", blocked: false, tenant });

  const uaAA = new UserAccount({
    account: accountA,
    user: userA,
    role: UserRole.OWNER, status: UserStatus.UNBLOCKED,
  });

  const uaAB = new UserAccount({
    account: accountA,
    user: userB,
    role: UserRole.ADMIN, status: UserStatus.UNBLOCKED,
  });

  const uaBB = new UserAccount({
    account: accountB,
    user: userB,
    role: UserRole.OWNER, status: UserStatus.UNBLOCKED,
  });

  await em.persistAndFlush([userA, userB, accountA, accountB, uaAA, uaAB, uaBB]);

  // insert another tenant. every test should work just fine
  const anotherTenant = await em.findOne(Tenant, { name: "another" }) ?? new Tenant({ name: "another" });
  const userC = new User({ tenant: anotherTenant, email: "123", name: "cName", userId: "c" });
  const accountC = new Account({ tenant: anotherTenant, accountName: "hpcc", blocked: false, comment: "123" });
  const uaCC = new UserAccount({ user: userC, account: accountC, role: UserRole.ADMIN, status: UserStatus.BLOCKED });

  await em.persistAndFlush([anotherTenant, userC, accountC, uaCC]);

  return { tenant, userA, userB, userC, accountA, accountB, accountC, uaAA, uaAB, uaBB, uaCC, anotherTenant };

}

export type InitialData = Awaited<ReturnType<typeof insertInitialData>>;


export async function insertBlockedData(em: SqlEntityManager) {

  const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

  const blockedUserA = new User({ name: "BlockedA", userId: "a", email: "a@a.com", tenant,
    tenantRoles: [TenantRole.TENANT_ADMIN]});
  const unblockedUserB = new User({ name: "BlockedB", userId: "b", email: "b@b.com", tenant });

  const unblockedAccountA = new Account({ accountName: "hpca", comment: "", blocked: false, tenant });
  const blockedAccountB = new Account({ accountName: "hpcb", comment: "", blocked: true, tenant });

  const uaAA = new UserAccount({
    account: unblockedAccountA,
    user: blockedUserA,
    role: UserRole.OWNER, status: UserStatus.BLOCKED,
  });

  const uaAB = new UserAccount({
    account: unblockedAccountA,
    user: unblockedUserB,
    role: UserRole.ADMIN, status: UserStatus.UNBLOCKED,
  });

  const uaBB = new UserAccount({
    account: blockedAccountB,
    user: unblockedUserB,
    role: UserRole.OWNER, status: UserStatus.UNBLOCKED,
  });

  await em.persistAndFlush([uaAA, uaAB, uaBB]);

  return { tenant, blockedUserA, unblockedUserB, unblockedAccountA, blockedAccountB, uaAA, uaAB, uaBB };

}

export type BlockedData = Awaited<ReturnType<typeof insertBlockedData>>;

