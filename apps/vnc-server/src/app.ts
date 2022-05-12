import { Server } from "@ddadaal/tsgrpc-server";
import { config } from "src/config";
import { plugins } from "src/plugins";
import { vncServiceServer } from "src/services/VncService";

export async function createServer() {
  const server = new Server({
    host: config.HOST,
    port: config.PORT,
    logger: { level: config.LOG_LEVEL },
  });

  server.logger.info({ config }, "Loaded config");

  for (const plugin of plugins) {
    await server.register(plugin);
  }

  await server.register(vncServiceServer);

  return server;
}
