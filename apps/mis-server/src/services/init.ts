import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { SystemState } from "src/entities/SystemState";
import { Tenant } from "src/entities/Tenant";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { InitServiceServer, InitServiceService } from "src/generated/server/init";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";

export const initServiceServer = plugin((server) => {

  server.addService<InitServiceServer>(InitServiceService, {

    querySystemInitialized: async ({ em }) => {
      const initializationTime = await em.findOne(SystemState, { key: SystemState.KEYS.INITIALIZATION_TIME });

      return [{ initialized: initializationTime !== null }];
    },

    createInitAdmin: async ({ request, em }) => {
      // get default tenant
      const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

      // create the user
      const { userId, email, name } = request;
      const user = new User({
        email, name, tenant, userId,
        platformRoles: [PlatformRole.PLATFORM_ADMIN], tenantRoles: [TenantRole.TENANT_ADMIN],
      });
      await em.persistAndFlush([tenant, user]);

      return [{}];
    },

    completeInit: async ({ em }) => {
      const initializationTime = new SystemState(SystemState.KEYS.INITIALIZATION_TIME, new Date().toISOString());

      try {
        await em.persistAndFlush(initializationTime);
      } catch (e) {
        if (e instanceof UniqueConstraintViolationException) {
          throw <ServiceError> { code: status.ALREADY_EXISTS };
        } else {
          throw e;
        }
      }

      return [{}];

    },


  });


});
