import fastify from "fastify";
import fastifyGracefulShutdown from "fastify-graceful-shutdown";
import { registerAuth } from "src/auth";
import { ioPlugin, registerConnectionHandler } from "src/io";
import { insertKey, publicKeyPlugin } from "src/publicKey";

import { config } from "./config";

const server = fastify({
  logger: { level: config.LOG_LEVEL },
});

if (process.argv.length > 2) {

  const users = process.argv.slice(2);
  server.log.info("Inserting public keys to %o", users);

  Promise.allSettled(users.map(async (user) => {
    insertKey(user, server.log);
  }));
}

server.register(publicKeyPlugin);
server.register(fastifyGracefulShutdown);

server.register(ioPlugin);

server.ready().then(() => {
  registerAuth(server);
  registerConnectionHandler(server);
});

server.listen(config.PORT, config.HOST);

