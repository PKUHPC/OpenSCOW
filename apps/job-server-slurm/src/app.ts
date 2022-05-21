import { Server } from "@ddadaal/tsgrpc-server";
import { omitConfigSpec } from "@scow/config";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { jobServiceServer } from "src/services/JobService";
import { vncServiceServer } from "src/services/VncService";

export async function createServer() {
  const server = new Server({
    host: config.HOST,
    port: config.PORT,
    logger: { level: config.LOG_LEVEL },
  });

  server.logger.info({ config: omitConfigSpec(config) }, "Loaded config");

  for (const plugin of plugins) {
    await server.register(plugin);
  }

  await server.register(vncServiceServer);
  await server.register(jobServiceServer);

  return server;
}
