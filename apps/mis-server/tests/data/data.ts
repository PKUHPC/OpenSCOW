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

  return { tenant, userA, userB, accountA, accountB, uaAA, uaAB, uaBB, anotherTenant };

}

export type InitialData = Awaited<ReturnType<typeof insertInitialData>>;
