/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { createUser } from "@scow/lib-auth";
import { misConfig } from "src/config/mis";
import { SystemState } from "src/entities/SystemState";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { InitServiceServer, InitServiceService } from "src/generated/server/init";
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
      const user = await createUserInDatabase(userId, name, email, DEFAULT_TENANT_NAME, server.logger, em)
        .catch((e) => {
          if (e.code === Status.ALREADY_EXISTS) {
            throw <ServiceError> {
              code: Status.ALREADY_EXISTS, 
              message:`User with userId ${userId} already exists in scow.`,
              details: "EXISTS_IN_SCOW",
            };        
          }
          throw <ServiceError> { 
            code: Status.INTERNAL, 
            message: `Error creating user with userId ${userId} in database.` };
        });

      user.platformRoles.push(PlatformRole.PLATFORM_ADMIN);
      user.tenantRoles.push(TenantRole.TENANT_ADMIN);
      await em.flush();
      // call auth
      // createdInAuth反映用户在本次创建之前用户否存在于认证系统，否->true, 是->false
      const createdInAuth = await createUser(misConfig.authUrl,
        { identityId: user.userId, id: user.id, mail: user.email, name: user.name, password },
        server.logger)
        .then(() => true)
        // If the call of creating user of auth fails,  delete the user created in the database.
        .catch(async (e) => {
          if (e.status === 409) {
            server.logger.warn(`User with userId ${ userId }  exists in auth.`);
            return false; 
          }
          // 回滚数据库
          await em.removeAndFlush(user),
          server.logger.error("Error creating user in auth.", e);
          throw <ServiceError> { code: Status.INTERNAL, message: `Error creating user ${user.id} in auth.` }; 
        });
      
      // 插入公钥失败也认为是创建用户成功
      await insertKeyToNewUser(userId, password, server.logger)
        .catch(() => null);

      return [{ createdInAuth: createdInAuth }];
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
