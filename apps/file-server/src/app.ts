import createError from "@fastify/error";
import { omitConfigSpec } from "@scow/config";
import fastify, { FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import gracefulShutdown from "fastify-graceful-shutdown";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { routes }  from "src/routes";

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
    logger: { level: config.LOG_LEVEL },
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

  server.log.info({ config: omitConfigSpec(config) }, "Loaded config");

  applyPlugins(server, pluginOverrides);

  server.register(gracefulShutdown);

  routes.forEach((r) => server.register(r));

  return server;
}

export async function startServer(server: FastifyInstance) {
  await server.listen({ port: config.PORT, host: config.HOST }).catch((err) => {
    server.log.error(err);
    throw err;
  });
}
