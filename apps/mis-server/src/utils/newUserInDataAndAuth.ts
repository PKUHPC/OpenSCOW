import { Logger } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { createUserInAuth } from "@scow/lib-auth";
import { insertKeyAsUser } from "@scow/lib-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { misConfig } from "src/config/mis";
import { StorageQuota } from "src/entities/StorageQuota";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";

export async function newUserInDataAndAuth(
  identityId: string, email: string, name: string, password: string, tenantName: string,
  logger: Logger, em: SqlEntityManager<MySqlDriver>) {
  const tenant = await em.findOne(Tenant, { name: tenantName });
  if (!tenant) {
    throw <ServiceError> { code: Status.NOT_FOUND, details: "Tenant is not found." };
  }
  const user = new User({ name, userId: identityId, tenant, email });

  user.storageQuotas.add(Object.keys(clusters).map((x) => new StorageQuota({
    cluster: x,
    storageQuota: 0,
    user: user!,
  })));

  try {
    await em.persistAndFlush(user);
  } catch (e) {
    if (e instanceof UniqueConstraintViolationException) {
      throw <ServiceError> { code: Status.ALREADY_EXISTS, message:`User with id ${identityId} already exists.` };
    } else {
      throw e;
    }
  }

  // call auth
  const rep = await createUserInAuth(identityId, user.id, email, name, password, misConfig.authUrl, logger);

  // If the call of creating user of auth fails,  delete the user created in the database.
  if (!rep.ok) {
    await em.removeAndFlush(user);

    if (rep.status === 409) {
      throw <ServiceError> {
        code: Status.ALREADY_EXISTS, message:`User with id ${user.id} already exists.`,
      };
    }

    logger.info("Error creating user in auth. code: %d, body: %o", rep.status, await rep.text());

    throw <ServiceError> { code: Status.INTERNAL, message: `Error creating user ${user.id} in auth.` };
  }

  // Making an ssh Request to the login node as the user created.
  if (process.env.NODE_ENV === "production") {
    await Promise.all(Object.values(clusters).map(async ({ displayName, slurm, misIgnore }) => {
      if (misIgnore) { return; }
      const node = slurm.loginNodes[0];
      logger.info("Checking if user can login to %s by login node %s", displayName, node);

      const error = await insertKeyAsUser(node, name, password, rootKeyPair, logger).catch((e) => e);
      if (error) {
        logger.info("user %s cannot login to %s by login node %s. err: %o", name, displayName, node, error);
        throw error;
      } else {
        logger.info("user %s login to %s by login node %s", name, displayName, node);
      }
    }));
  }

  return user.id;
}