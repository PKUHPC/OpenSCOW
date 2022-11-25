import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { sshRawConnectByPassword } from "@scow/lib-ssh";
import { clusters } from "src/config/clusters";
import { SystemState } from "src/entities/SystemState";
import { Tenant } from "src/entities/Tenant";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { InitServiceServer, InitServiceService } from "src/generated/server/init";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { newUserInDataAndAuth } from "src/utils/newUserInDatabaseAndAuth";

export const initServiceServer = plugin((server) => {

  server.addService<InitServiceServer>(InitServiceService, {

    querySystemInitialized: async ({ em }) => {
      const initializationTime = await em.findOne(SystemState, { key: SystemState.KEYS.INITIALIZATION_TIME });

      return [{ initialized: initializationTime !== null }];
    },

    isUserExist: async ({ request, em }) => {
      const { name, password, userId } = request;
      const isExist = {
        isExistInScow: false,
        isExistInLdap: true,
      };

      // Check whether the user already exists in scow, if it exists, report an error directly
      const user = await em.findOne(User, { userId, tenant: { name: DEFAULT_TENANT_NAME } });
      if (user) {
        isExist["isExistInScow"] = true;
      }
      // If there is no this user in scow, check whether the user exists in the authentication system
      await Promise.all(Object.values(clusters).map(async ({ displayName, slurm, misIgnore }) => {
        if (misIgnore) {
          return;
        }
        const node = slurm.loginNodes[0];
        server.logger.info("Checking if user can login to %s by login node %s", displayName, node);
        try {
          await sshRawConnectByPassword(node, name, password, server.logger);
        } catch (e) {
          isExist["isExistInLdap"] = false;
        }
      }));
      return [{
        isExistInScow: isExist["isExistInScow"],
        isExistInLdap: isExist["isExistInLdap"],
      }];
    },

    createInitAdmin: async ({ request, em }) => {
      // get default tenant
      const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

      // create the user
      const { userId, email, name, password, isExist } = request;
      const user = new User({
        email, name, tenant, userId,
        platformRoles: [PlatformRole.PLATFORM_ADMIN], tenantRoles: [TenantRole.TENANT_ADMIN],
      });
      if (isExist) {
        // If the user exists, write it directly to the database
        await em.persistAndFlush([tenant, user]);
      }
      else if (server.ext.capabilities.createUser) {
        // If the user does not exist, create the user first and then write it into the database
        await newUserInDataAndAuth(user, password, server.logger, em);
      }
      return [{}];
    },

    setAsInitAdmin: async ({ request, em }) => {

      const user = await em.findOne(User, {
        userId: request.userId,
        tenant: { name: DEFAULT_TENANT_NAME },
      });

      if (!user) {
        throw <ServiceError> {
          code: status.NOT_FOUND,
          message: `User ${request.userId} is not found in default tenant.`,
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
    },

    unsetInitAdmin: async ({ request, em }) => {
      const user = await em.findOne(User, {
        userId: request.userId,
        tenant: { name: DEFAULT_TENANT_NAME },
      });

      if (!user) {
        throw <ServiceError> {
          code: status.NOT_FOUND,
          message: `User ${request.userId} is not found in default tenant.`,
        };
      }

      user.platformRoles = user.platformRoles.filter((x) => x !== PlatformRole.PLATFORM_ADMIN);
      user.tenantRoles = user.tenantRoles.filter((x) => x !== TenantRole.TENANT_ADMIN);

      await em.flush();

      return [{}];

    },

    completeInit: async ({ em }) => {
      const initializationTime = new SystemState(SystemState.KEYS.INITIALIZATION_TIME, new Date().toISOString());

      try {
        await em.persistAndFlush(initializationTime);
      } catch (e) {
        if (e instanceof UniqueConstraintViolationException) {
          throw <ServiceError> {
            code: status.ALREADY_EXISTS, message: "already initialized",
          };
        } else {
          throw e;
        }
      }

      return [{}];

    },


  });


});
