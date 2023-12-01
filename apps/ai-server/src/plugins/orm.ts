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

import { EntityManager, MikroORM, Options } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { join } from "path";
import { aiConfig } from "src/config/ai";
import { config } from "src/config/env";

import { entities } from "../entities";

const distPath = process.env.NODE_ENV === "production" ? "build" : "src";

export const ormConfigs = {
  host: aiConfig.db.host,
  port: aiConfig.db.port,
  user: aiConfig.db.user,
  dbName: config.DB_NAME ?? aiConfig.db.dbName,
  password: config.DB_PASSWORD ?? aiConfig.db.password,
  type: "mysql",
  forceUndefined: true,
  runMigrations: true,
  migrations: {
    path: join(distPath, "migrations"),
    pattern: /^[\w-]+\d+\.(j|t)s$/,
  },
  entities,
  debug: aiConfig.db.debug,
  seeder: {
    path: join(distPath, "seenders"),
  },
} as Options<MySqlDriver>;

const ormPlugin: FastifyPluginAsync = async (
  server: FastifyInstance,
) => {

  const logger = server.log.child({ plugin: "orm" });

  const orm = await MikroORM.init<MySqlDriver>({
    ...ormConfigs,
    logger: (msg) => logger.info(msg),
  });

  const schemaGenerator = orm.getSchemaGenerator();
  await schemaGenerator.ensureDatabase();
  await orm.getMigrator().up();

  await server.decorate("orm", orm);

  logger.info("orm has been decorated");

  // 注入em,但无效
  // server.addHook("onRequest", async (request: FastifyRequest) => {
  //   request.em = server.orm.em.fork() as EntityManager;
  // });

  server.addHook("onClose", async (server) => {
    logger.info("Closing db connection.");
    await server.orm.close();
    logger.info("db connection has been closed.");
  });

};

export default fastifyPlugin(ormPlugin, "4.x");
