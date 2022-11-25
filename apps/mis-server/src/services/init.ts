import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { createUser } from "@scow/lib-auth";
import { insertKeyAsUser, sshRawConnectByPassword } from "@scow/lib-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { misConfig } from "src/config/mis";
import { SystemState } from "src/entities/SystemState";
import { Tenant } from "src/entities/Tenant";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { InitServiceServer, InitServiceService } from "src/generated/server/init";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { createUserInDatabase } from "src/utils/createUser";

export const initServiceServer = plugin((server) => {

  server.addService<InitServiceServer>(InitServiceService, {

    querySystemInitialized: async ({ em }) => {
      const initializationTime = await em.findOne(SystemState, { key: SystemState.KEYS.INITIALIZATION_TIME });

      return [{ initialized: initializationTime !== null }];
    },

    userExists: async ({ request, em }) => {
      const { name, password, userId } = request;
      let existsInAuth = true;

      // Check whether the user already exists in scow
      const user = await em.findOne(User, { userId, tenant: { name: DEFAULT_TENANT_NAME } });

      const cluster = Object.values(clusters).find((c) => c.misIgnore === false);
      const node = cluster!.slurm.loginNodes[0];
      try {
        await sshRawConnectByPassword(node, name, password, server.logger);
      } catch (e) {
        existsInAuth = false;
      }

      return [{
        existsInScow: !!user,
        existsInAuth: existsInAuth,
      }];
    },

    createInitAdmin: async ({ request, em }) => {
      // get default tenant
      const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

      // new the user
      const { userId, email, name, password, existsInAuth } = request;
      const user = new User({
        email, name, tenant, userId,
        platformRoles: [PlatformRole.PLATFORM_ADMIN], tenantRoles: [TenantRole.TENANT_ADMIN],
      });

      if (existsInAuth) {
        // If the user exists, write it directly to the database
        await em.persistAndFlush([tenant, user]);
      }
      else if (server.ext.capabilities.createUser) {

        // If the user does not exist in Auth, create the user in database firstly
        await createUserInDatabase(user, server.logger, em);

        // call auth
        await createUser(misConfig.authUrl,
          { identityId: user.userId, id: user.id, mail: user.email, name: user.name, password }, server.logger)
        // If the call of creating user of auth fails,  delete the user created in the database.
          .catch(async (e) => {
            await em.removeAndFlush(user);
            if (e.status === 409) {
              throw <ServiceError>{
                code: Status.ALREADY_EXISTS, message:`User with id ${user.name} already exists.`,
              };
            }

            server.logger.error("Error creating user in auth.", e);

            throw <ServiceError> { code: Status.INTERNAL, message: `Error creating user ${user.id} in auth.` };
          });
        
        // Making an ssh Request to the login node as the user created.
        if (process.env.NODE_ENV === "production") {
          await Promise.all(Object.values(clusters).map(async ({ displayName, slurm, misIgnore }) => {
            if (misIgnore) { return; }
            const node = slurm.loginNodes[0];
            server.logger.info("Checking if user can login to %s by login node %s", displayName, node);

            const error = await insertKeyAsUser(node, user.name, password, rootKeyPair, server.logger).catch((e) => e);
            if (error) {
              server.logger
                .info("user %s cannot login to %s by login node %s. err: %o", name, displayName, node, error);
              throw error;
            } else {
              server.logger.info("user %s login to %s by login node %s", name, displayName, node);
            }
          }));
        }

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
