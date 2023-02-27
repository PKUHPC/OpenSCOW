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

import createError from "@fastify/error";
import { omitConfigSpec } from "@scow/lib-config";
import { getVersionMessage, readVersionFile } from "@scow/utils/build/version";
import fastify, { FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { routes } from "src/routes";

type Plugin = FastifyPluginAsync | FastifyPluginCallback;
type PluginOverrides = Map<Plugin, Plugin>;

function applyPlugins(server: FastifyInstance, pluginOverrides?: PluginOverrides) {
  plugins.forEach((plugin) => {
    server.register(pluginOverrides && pluginOverrides.has(plugin)
      ? pluginOverrides.get(plugin)!
      : plugin);
  });
}

const ValidationError = createError("BAD_REQUEST", "Errors occurred when validating %s. Errors are \n%o", 400);

export function buildApp(pluginOverrides?: PluginOverrides) {

  const server = fastify({
    logger: {
      level: config.LOG_LEVEL,
      ...config.LOG_PRETTY ? {
        transport: { target: "pino-pretty" },
      } : {},
    },
    ajv: {
      customOptions: {
        coerceTypes: "array",
      },
      plugins: [(ajv) => {
        ajv.addKeyword({ keyword: "kind" });
        ajv.addKeyword({ keyword: "modifier" });
      }],
    },
    schemaErrorFormatter: (errors, dataVar) => {
      return new ValidationError(dataVar, errors);
    },
  });

  server.log.info("@scow/auth: ", getVersionMessage(readVersionFile()));

  server.log.info({ config: omitConfigSpec(config) }, "Loaded env config");

  applyPlugins(server, pluginOverrides);

  routes.forEach((r) => server.register(r));

  return server;
}

export async function startServer(server: FastifyInstance) {
  await server.listen({ port: config.PORT, host: config.HOST }).catch((err) => {
    server.log.error(err);
    throw err;
  });
}
