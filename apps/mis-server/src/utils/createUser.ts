import { Logger } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { clusters } from "src/config/clusters";
import { StorageQuota } from "src/entities/StorageQuota";
import { User } from "src/entities/User";

export async function createUserInDatabase(
  user: User, logger: Logger, em: SqlEntityManager<MySqlDriver>) {
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
  return user.id;
}
