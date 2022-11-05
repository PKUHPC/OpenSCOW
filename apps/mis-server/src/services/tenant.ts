import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { QueryOrder, UniqueConstraintViolationException } from "@mikro-orm/core";
import { decimalToMoney } from "@scow/lib-decimal";
import { count } from "console";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { TenantRole, User } from "src/entities/User";
import { TenantServiceServer, TenantServiceService } from "src/generated/server/tenant";


export const tenantServiceServer = plugin((server) => {

  server.addService<TenantServiceServer>(TenantServiceService, {
    getTenantInfo: async ({ request, em }) => {
      const { tenantName } = request;

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (!tenant) {
        throw <ServiceError>{ code: status.NOT_FOUND, message: `Tenant ${tenantName} is not found.` };
      }

      const accountCount = await em.count(Account, { tenant });
      const userCount = await em.count(User, { tenant });
      const admins = await em.find(User, { tenant, tenantRoles: { $like: `%${TenantRole.TENANT_ADMIN}%` } }, {
        fields: ["id", "name"],
      });

      return [{
        accountCount,
        admins: admins.map((a) => ({ userId: a.id + "", userName: a.name })),
        userCount,
        balance: decimalToMoney(tenant.balance),
      }];
    },

    getTenants: async ({ em }) => {
      const tenants = await em.find(Tenant, {}, { fields: ["name"]});

      return [{ names: tenants.map((x) => x.name) }];
    },

    getAllTenants: async ({ em }) => {
      const tenants = await em.find(Tenant, {});
      const userCountObjectArray: { tCount: number, tId: number }[]
        = await em.createQueryBuilder(User, "u")
          .select("count(u.user_id) as tCount, u.tenant_id as tId").orderBy({ tenant_id: QueryOrder.ASC })
          .groupBy("u.tenant_id").execute("all");
      // 将获查询得的对象数组userCountObjectArray转换为{"tenant_id":"userCountOfTenant"}形式
      const userCount = {};
      userCountObjectArray.map((x) => {
        userCount[x.tId] = x.tCount;
      });
      const accountCountObjectArray: { tCount: number, tId: number }[]
        = await em.createQueryBuilder(Account, "a")
          .orderBy({ tenant_id: QueryOrder.ASC }).select("count(a.id) as tCount, a.tenant_id as tId")
          .groupBy("a.tenant_id").execute("all");
      // 将获查询得的对象数组accountCountObjectArray转换为{"tenant_id":"accountCountOfTenant"}形式
      const accountCount = {};
      accountCountObjectArray.map((x) => {
        accountCount[x.tId] = x.tCount;
      });
      return [
        {
          totalCount: tenants.length,
          platformTenants: tenants.map((x) => ({
            tenantId:x.id,
            tenantName: x.name,
            // 初始创建租户时，其中无账户和用户,
            userCount: userCount[`${x.id}`] ?? 0,
            accountCount: accountCount[`${x.id}`] ?? 0,
            balance:decimalToMoney(x.balance),
          })),
        }];
    },

    createTenant: async ({ request, em }) => {
      const { name } = request;
      server.logger.info(`start to create tenant: ${name} `);
      // create tenant in database
      const newTenant = new Tenant({ name });
      try {
        await em.persistAndFlush(newTenant);
      } catch (e) {
        if (e instanceof UniqueConstraintViolationException) {
          throw <ServiceError> { code: Status.ALREADY_EXISTS, message:`Tenant with ${newTenant.name} already exists.` };
        } else {
          throw e;
        }
      }
      return [{}];
    },
  });

});
