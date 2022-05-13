import fastify from "fastify";
import fastifyGracefulShutdown from "fastify-graceful-shutdown";
import { registerAuth } from "src/auth";
import { ioPlugin, registerConnectionHandler } from "src/io";

import { config } from "./config";

const server = fastify({
  logger: { level: config.LOG_LEVEL },
});

server.register(fastifyGracefulShutdown);

server.register(ioPlugin);

server.ready().then(() => {
  registerAuth(server);
  registerConnectionHandler(server);
});

server.listen(config.PORT, config.HOST);

