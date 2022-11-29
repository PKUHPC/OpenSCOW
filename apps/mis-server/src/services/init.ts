import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { createUser, getUser } from "@scow/lib-auth";
import { clusters } from "src/config/clusters";
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
      const { userId } = request;

      // Check whether the user already exists in scow
      const user = await em.findOne(User, { userId, tenant: { name: DEFAULT_TENANT_NAME } });

      if (server.ext.capabilities.getUser) {
        const cluster = Object.values(clusters).find((c) => c.misIgnore === false);
        const node = cluster!.slurm.loginNodes[0];
        const userInfo = await getUser(node, { identityId: userId }, server.logger);
        return [{
          existsInScow: !!user,
          existsInAuth: !!userInfo,
          getUserCapability: true,
        }];
      }

      // 如果不支持查询，则直接返回existsInAuth: undefined
      return [{
        existsInScow: !!user,
        existsInAuth: undefined,
        getUserCapability: false,
      }];
    },

    createInitAdmin: async ({ request, em }) => {
      const { userId, email, name, password, existsInAuth } = request;

      if (server.ext.capabilities.getUser && !existsInAuth && !server.ext.capabilities.createUser) {
        // 认证系统支持查询用户,且不存在于认证系统，且认证系统不支持创建用户
        return [{ createdResult: false }];
      } else {
        // get default tenant
        const tenant = await em.findOneOrFail(Tenant, { name: DEFAULT_TENANT_NAME });

        // new the user
        const user = new User({
          email, name, tenant, userId,
          platformRoles: [PlatformRole.PLATFORM_ADMIN], tenantRoles: [TenantRole.TENANT_ADMIN],
        });

        // 认证系统支持查询 && 存在于认证系统
        // 认证系统支持查询 && 不存在于认证系统 && 认证系统支持创建用户
        // 认证系统不支持查询 
        // -> 都要在数据库进行创建
        await createUserInDatabase(user, password, server.logger, em);
        if (existsInAuth) {
          // 认证系统存在则无需下一步
          return [{ createdResult: true }];
        } else {
          let result = true;
          // 认证系统中不存在 && 认证系统支持创建
          // 认证系统不支持查询
          // -> 都要尝试创建
          // call auth
          await createUser(misConfig.authUrl,
            { identityId: user.userId, id: user.id, mail: user.email, name: user.name, password }, server.logger)
          // If the call of creating user of auth fails,  delete the user created in the database.
            .catch(async (e) => {
              result = false;
              await em.removeAndFlush(user);
              if (e.status === 409) {
                throw <ServiceError>{
                  code: Status.ALREADY_EXISTS, message:`User with id ${user.name} already exists.`,
                };
              }

              server.logger.error("Error creating user in auth.", e);

              throw <ServiceError> { code: Status.INTERNAL, message: `Error creating user ${user.id} in auth.` };
            });
          
          return [{ createdResult: result }];
        }
      }
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
