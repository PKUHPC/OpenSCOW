import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { t, UniqueConstraintViolationException } from "@mikro-orm/core";
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
      const userCount = await em.getConnection()
        .execute("select tenant_id, count(*) as count from user group by tenant_id");
      const accountCount = await em.getConnection()
        .execute("select tenant_id, count(*) as count from user group by tenant_id");
      // console.log(userCount);
      // userCount.find((x) => {
      //   console.log(x);
      //   x.tenant_id === 1;
      // });
      server.logger.info("test userCount");
      userCount.map((x) => {
        server.logger.info(x);
        server.logger.info(x.tenant_id, x.count);
      });

      server.logger.info("test tenants");
      tenants.map((x) => {
        server.logger.info(x);
        server.logger.info(x.id);
        const g = userCount.find((t) => t.tenant_id === x.id);
        console.log(g);
      });

      return [
        {
          totalCount: tenants.length,
          platformTenants: tenants.map((x) => ({
            tenantId:x.id,
            tenantName: x.name,
            // 初始创建租户时，其中无账户和用户

            userCount: userCount.find((t) => t.tenant_id === x.id)?.count ?? 0,
            accountCount: accountCount.find((t) => t.tenant_id === x.id)?.count ?? 0,
            // userCount: 0,
            // accountCount: 0,
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
