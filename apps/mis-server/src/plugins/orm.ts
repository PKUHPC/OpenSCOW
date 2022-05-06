import { plugin } from "@ddadaal/tsgrpc-server";
import { MikroORM, Options } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { config } from "src/config";

import { entities } from "../entities";

export const ormConfigs = {
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  dbName: config.DB_DBNAME,
  password: config.DB_PASSWORD,
  type: "mysql",
  forceUndefined: true,
  runMigrations: true,
  migrations: {
    path: "./src/migrations",
    pattern: /^[\w-]+\d+\.(j|t)s$/,
  },
  entities,
  debug: config.DB_DEBUG,
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
