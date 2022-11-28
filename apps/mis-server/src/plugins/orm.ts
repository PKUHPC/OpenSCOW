import { plugin } from "@ddadaal/tsgrpc-server";
import { MikroORM, Options } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { join } from "path";
import { config } from "src/config/env";
import { misConfig } from "src/config/mis";
import { DatabaseSeeder } from "src/seeders/DatabaseSeeder";

import { entities } from "../entities";

const distPath = process.env.NODE_ENV === "production" ? "build" : "src";

export const ormConfigs = {
  host: misConfig.db.host,
  port: misConfig.db.port,
  user: misConfig.db.user,
  dbName: config.DB_NAME ?? misConfig.db.dbName,
  password: config.DB_PASSWORD ?? misConfig.db.password,
  type: "mysql",
  forceUndefined: true,
  runMigrations: true,
  migrations: {
    path: join(distPath, "migrations"),
    pattern: /^[\w-]+\d+\.(j|t)s$/,
  },
  entities,
  debug: misConfig.db.debug,
  seeder: {
    path: join(distPath, "seenders"),
  },
} as Options<MySqlDriver>;

export const ormPlugin = plugin(async (server) => {
  // create the database if not exists.

  const logger = server.logger.child({ plugin: "orm" });

  const orm = await MikroORM.init<MySqlDriver>({
    ...ormConfigs,
    logger: (msg) => logger.info(msg),
  });

  const schemaGenerator = orm.getSchemaGenerator();
  await schemaGenerator.ensureDatabase();
  await orm.getMigrator().up();

  await orm.getSeeder().seed(DatabaseSeeder);

  server.addExtension("orm", orm);

  server.addRequestHook((req) => {
    req.em = orm.em.fork();
  });

  server.addCloseHook(async () => {
    logger.info("Closing db connection.");
    await orm.close();
    logger.info("db connection has been closed.");
  });

});
