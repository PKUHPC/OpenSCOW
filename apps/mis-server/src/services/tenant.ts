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
import { decimalToMoney } from "@scow/lib-decimal";
import { TenantServiceServer, TenantServiceService } from "@scow/protos/build/server/tenant";
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { Tenant } from "src/entities/Tenant";
import { TenantRole, User } from "src/entities/User";
import { callHook } from "src/plugins/hookClient";
import { createUserInDatabase, insertKeyToNewUser } from "src/utils/createUser";


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
        fields: ["id", "userId", "name"],
      });

      return [{
        accountCount,
        admins: admins.map((a) => ({ id: a.id + "", userId: a.userId, userName: a.name })),
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
      const userCountObjectArray: { tCount: number, tId: number }[]
        = await em.createQueryBuilder(User, "u")
          .select("count(u.user_id) as tCount, u.tenant_id as tId")
          .groupBy("u.tenant_id").execute("all");
      // 将获查询得的对象数组userCountObjectArray转换为{"tenant_id":"userCountOfTenant"}形式
      const userCount = {};
      userCountObjectArray.map((x) => {
        userCount[x.tId] = x.tCount;
      });
      const accountCountObjectArray: { tCount: number, tId: number }[]
        = await em.createQueryBuilder(Account, "a")
          .select("count(a.id) as tCount, a.tenant_id as tId")
          .groupBy("a.tenant_id").execute("all");
      // 将获查询得的对象数组accountCountObjectArray转换为{"tenant_id":"accountCountOfTenant"}形式
      const accountCount = {};
      accountCountObjectArray.map((x) => {
        accountCount[x.tId] = x.tCount;
      });
      return [
        {
          totalCount: tenants.length,
          platformTenants: tenants.map((x) => ({
            tenantId:x.id,
            tenantName: x.name,
            // 初始创建租户时，其中无账户和用户,
            userCount: userCount[`${x.id}`] ?? 0,
            accountCount: accountCount[`${x.id}`] ?? 0,
            balance:decimalToMoney(x.balance),
            createTime: x.createTime.toISOString(),
          })),
        }];
    },

    createTenant: async ({ request, em, logger }) => {
      const { tenantName, userId, userName, userEmail, userPassword } = request;

      const tenant = await em.findOne(Tenant, { name: tenantName });
      if (tenant) {
        throw <ServiceError>{
          code: Status.ALREADY_EXISTS, message: "The tenant already exists", details: "TENANT_ALREADY_EXISTS",
        };
      }
      logger.info(`start to create tenant: ${tenantName} `);
      const newTenant = new Tenant({ name: tenantName });

      return await em.transactional(async (em) => {
        // 在数据库中创建租户
        await em.persistAndFlush(newTenant).catch((e) => {
          if (e instanceof UniqueConstraintViolationException) {
            throw <ServiceError>{
              code: Status.ALREADY_EXISTS, message: "The tenant already exists", details: "TENANT_ALREADY_EXISTS",
            };
          }
          throw <ServiceError>{ code: Status.INTERNAL, message: "Error creating tenant in database." };
        });

        // 在数据库中创建user
        const user = await createUserInDatabase(userId, userName, userEmail, tenantName, logger, em)
          .then(async (user) => {
            user.tenantRoles = [TenantRole.TENANT_ADMIN];
            await em.persistAndFlush(user);
            return user;
          }).catch((e) => {
            if (e.code === Status.ALREADY_EXISTS) {
              throw <ServiceError>{
                code: Status.ALREADY_EXISTS,
                message: `User with userId ${userId} already exists in scow.`,
                details: "USER_ALREADY_EXISTS",
              };
            }
            throw <ServiceError>{
              code: Status.INTERNAL,
              message: `Error creating user with userId ${userId} in database.`,
            };
          });
        // call auth
        const createdInAuth = await createUser(misConfig.authUrl,
          { identityId: user.userId, id: user.id, mail: user.email, name: user.name, password: userPassword },
          logger)
          .then(async () => {
            await insertKeyToNewUser(userId, userPassword, logger)
              .catch(() => { });
            return true;
          })
          .catch(async (e) => {
            if (e.status === 409) {
              logger.warn("User exists in auth.");
              return false;
            } else {
              logger.error("Error creating user in auth.", e);
              throw <ServiceError>{
                code: Status.INTERNAL,
                message: `Error creating user with userId ${userId} in auth.`,
              };
            }
          });
        await callHook("userCreated", { tenantName, userId: user.userId }, logger);
        return [{ tenantId: newTenant.id, userId: user.id, createdInAuth: createdInAuth }];
      },
      );
    },
  });

});
