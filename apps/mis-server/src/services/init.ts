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
import { SystemState } from "src/entities/SystemState";
import { PlatformRole, TenantRole, User } from "src/entities/User";
import { InitServiceServer, InitServiceService } from "src/generated/server/init";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { createUserInAuth, createUserInDatabase } from "src/utils/createUser";
import { setAsInitAdmin } from "src/utils/setAsAdmin";
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
      const user = await createUserInDatabase(userId, name, email, DEFAULT_TENANT_NAME, server.logger, em)
        .catch((e) => {
          if (e.code === 6) {
            throw <ServiceError>{
              code: Status.ALREADY_EXISTS, 
              message:`User with id ${name} already exists in scow.`,
              cause: "EXISTS_IN_SCOW",
            }; 
          }
        });
      await createUserInAuth(user!, password, server.logger, em)
        .catch((e) => {
          if (e.code === 6) {
            throw <ServiceError>{
              code: Status.ALREADY_EXISTS, 
              message:`User with id ${name} already exists in scow.`,
              cause: "EXISTS_IN_AUTH",
            }; 
          }
        });
      await setAsInitAdmin(userId, em);
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
