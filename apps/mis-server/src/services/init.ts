import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { createUser } from "@scow/lib-auth";
import { InitServiceServer, InitServiceService } from "@scow/protos/build/server/init";
import { authUrl } from "src/config";
import { configClusters } from "src/config/clusters";
import { config } from "src/config/env";
import { SystemState } from "src/entities/SystemState";
import { PlatformRole, TenantRole, User, UserState } from "src/entities/User";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { createUserInDatabase, insertKeyToNewUser } from "src/utils/createUser";
import { userExists } from "src/utils/userExists";

export const initServiceServer = plugin((server) => {

  server.addService<InitServiceServer>(InitServiceService, {

    querySystemInitialized: async ({ em }) => {
      const initializationTime = await em.findOne(SystemState, { key: SystemState.KEYS.INITIALIZATION_TIME });

      return [{ initialized: initializationTime !== null }];
    },

    userExists: async ({ request, em }) => {
      const { userId } = request;
      const result = await userExists(userId, server.logger, em);
      return [{
        existsInScow: result.existsInScow,
        existsInAuth: result.existsInAuth,
      }];
    },

    createInitAdmin: async ({ request, em }) => {
      const { userId, email, name, password } = request;
      // 需要注意，如果扔出异常，前端会根据异常结果显示不同提示
      // 显示两种情况，认证系统中创建失败的原因ALREADY_EXISTS_IN_AUTH=>成功
      // 显示两种情况，其他错误=>失败
      const user =
       await createUserInDatabase(userId, name, email, DEFAULT_TENANT_NAME, server.logger, em)
         .catch((e) => {
           if (e.code === Status.ALREADY_EXISTS) {
             throw {
               code: Status.ALREADY_EXISTS,
               message:`User with userId ${userId} already exists in scow.`,
               details: "EXISTS_IN_SCOW",
             } as ServiceError;
           }
           throw {
             code: Status.INTERNAL,
             message: `Error creating user with userId ${userId} in database.` } as ServiceError;
         });

      user.platformRoles.push(PlatformRole.PLATFORM_ADMIN);
      user.tenantRoles.push(TenantRole.TENANT_ADMIN);
      await em.flush();
      // call auth
      // createdInAuth反映用户在本次创建之前用户否存在于认证系统，否->true, 是->false
      const createdInAuth = await createUser(authUrl,
        { identityId: user.userId, id: user.id, mail: user.email, name: user.name, password },
        server.logger)
        .then(async () => {
          // 插入公钥失败也认为是创建用户成功
          // 在所有集群下执行
          // 如果 SCOWD 开启则不需要插入公钥
          const filterClusterConfig = Object.fromEntries(
            Object.entries(configClusters).filter(([_, value]) => value.scowd?.enabled !== true));

          await insertKeyToNewUser(userId, password, server.logger, filterClusterConfig)
            .catch(() => {});
          
          return true;
        })
        // If the call of creating user of auth fails,  delete the user created in the database.
        .catch(async (e) => {
          if (e.status === 409) {
            server.logger.warn(`User with userId ${ userId }  exists in auth.`);
            return false;
          }
          // 回滚数据库
          await em.removeAndFlush(user);
          server.logger.error("Error creating user in auth.", e);
          throw { code: Status.INTERNAL, message: `Error creating user ${user.id} in auth.` } as ServiceError;
        });

      return [{ createdInAuth: createdInAuth }];
    },

    setAsInitAdmin: async ({ request, em }) => {

      const user = await em.findOne(User, {
        userId: request.userId,
        tenant: { name: DEFAULT_TENANT_NAME },
      });

      if (!user || user.state === UserState.DELETED) {
        throw {
          code: status.NOT_FOUND,
          message: `User ${request.userId} is not found or has been deleted in default tenant.`,
        } as ServiceError;
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

      if (!user || user.state === UserState.DELETED) {
        throw {
          code: status.NOT_FOUND,
          message: `User ${request.userId} is not found or has been deleted in default tenant.`,
        } as ServiceError;
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
          throw {
            code: status.ALREADY_EXISTS, message: "already initialized",
          } as ServiceError;
        } else {
          throw e;
        }
      }

      return [{}];

    },


  });


});
