import { Logger } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { insertKeyAsUser } from "@scow/lib-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { StorageQuota } from "src/entities/StorageQuota";
import { User } from "src/entities/User";

export async function createUserInDatabase(
  user: User, password: string, logger: Logger, em: SqlEntityManager<MySqlDriver>) {
  user.storageQuotas.add(Object.keys(clusters).map((x) => new StorageQuota({
    cluster: x,
    storageQuota: 0,
    user: user!,
  })));
  try {
    await em.persistAndFlush(user);
  } catch (e) {
    if (e instanceof UniqueConstraintViolationException) {
      throw <ServiceError> { code: Status.ALREADY_EXISTS, message:`User with id ${user.id} already exists.` };
    } else {
      throw e;
    }
  }

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

  return user.id;
}
