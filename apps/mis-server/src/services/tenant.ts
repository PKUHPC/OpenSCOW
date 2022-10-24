import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
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
      const [tenants, tenantCount] = await em.findAndCount(Tenant, {});
      // 
      // const userCount = await em.count(User);
      // const userCount= await em.count(Account);
      return [
        {

          totalCount:tenantCount,
          // userCount:userCount,
          // accountCount:userCount,
          platformTenants:tenants.map((x) => ({
            tenantId:x.id,
            tenantName:x.name,
            balabce:x.balance,
          })),
        }];
    },

  });

});
