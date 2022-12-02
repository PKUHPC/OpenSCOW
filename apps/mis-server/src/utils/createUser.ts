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

import { Logger } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { createUser } from "@scow/lib-auth";
import { insertKeyAsUser } from "@scow/lib-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { misConfig } from "src/config/mis";
import { StorageQuota } from "src/entities/StorageQuota";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";

export async function createUserInDatabase(
  userId: string, name: string, email: string, tenantName: string, logger: Logger, em: SqlEntityManager<MySqlDriver>) {
  // get default tenant
  const tenant = await em.findOne(Tenant, { name: tenantName });
  if (!tenant) {
    throw <ServiceError> { code: Status.NOT_FOUND, message: `Tenant ${tenantName} is not found.` };
  }
  // new the user
  const user = new User({
    email, name, tenant, userId,
  });

  user.storageQuotas.add(Object.keys(clusters).map((x) => new StorageQuota({
    cluster: x,
    storageQuota: 0,
    user: user!,
  })));
  try {
    await em.persistAndFlush(user);
  } catch (e) {
    if (e instanceof UniqueConstraintViolationException) {
      throw <ServiceError> { 
        code: Status.ALREADY_EXISTS, 
        message:`User with id ${user.id} already exists.`,
        details: "EXISTS_IN_SCOW",
      };
    } else {
      throw e;
    }
  }
  return user;
}

export async function createUserInAuth(
  user: User, password: string, logger: Logger) {
  await createUser(misConfig.authUrl,
    { identityId: user.userId, id: user.id, mail: user.email, name: user.name, password },
    logger)
    // If the call of creating user of auth fails,  delete the user created in the database.
    .catch(async (e) => {
      if (e.status === 409) {
        throw <ServiceError>{
          code: Status.ALREADY_EXISTS, 
          message:`User with id ${user.name} already exists in auth.`,
          details: "EXISTS_IN_AUTH",
        }; 
      }
      logger.error("Error creating user in auth.", e);
      throw <ServiceError> { code: Status.INTERNAL, message: `Error creating user ${user.id} in auth.` }; 
    });

  // Making an ssh Request to the login node as the user created.
  if (process.env.NODE_ENV === "production") {
    await Promise.all(Object.values(clusters).map(async ({ displayName, slurm, misIgnore }) => {
      if (misIgnore) { return; }
      const node = slurm.loginNodes[0];
      logger.info("Checking if user can login to %s by login node %s", displayName, node);
    
      const error = await insertKeyAsUser(node, user.name, password, rootKeyPair, logger).catch((e) => e);
      if (error) {
        logger
          .info("user %s cannot login to %s by login node %s. err: %o", name, displayName, node, error);
        throw error;
      } else {
        logger.info("user %s login to %s by login node %s", name, displayName, node);
      }
    }));
  }
}


// 需要注意认证系统已存在与scow中已存在返回code相同，但是details不同
export async function createUserInDatabaseAndAuth(
  userId: string, name: string, email: string, password: string, tenantName: string, 
  logger: Logger, em: SqlEntityManager<MySqlDriver>) {
  const user = await createUserInDatabase(userId, name, email, tenantName, logger, em);
  await createUserInAuth(user!, password, logger)
    .catch(async (e) => {
      if (e.code === Status.INTERNAL) {
        await em.removeAndFlush(user);
        throw <ServiceError> { 
          code: Status.INTERNAL, 
          message: `Error creating user ${user.id} in auth.` };
      }
      throw e;
    });
  return user;
}

