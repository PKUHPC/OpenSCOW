import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { decimalToMoney } from "@scow/lib-decimal";
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

      console.log("aaa");
      const userCount = await em.getConnection()
        .execute("select tenant_id, count(*) as count from user group by tenant_id");
      const accountCount = await em.getConnection()
        .execute("select tenant_id, count(*) as count from user group by tenant_id");
      return [
        {
          totalCount: tenants.length,
          platformTenants: tenants.map((x) => ({
            tenantId:x.id,
            tenantName: x.name,
            userCount: userCount.find((t) => t.tenant_id === x.id)!.count,
            accountCount: accountCount.find((t) => t.tenant_id === x.id)!.count,
            balance:decimalToMoney(x.balance),
          })),
        }];
    },

    createTenant: async ({ request, em }) => {
      const { name } = request;
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
      return;
    },

  });

});
