import { Server } from "@ddadaal/tsgrpc-server";
import { omitConfigSpec } from "@scow/config";
import { config } from "src/config";
import { plugins } from "src/plugins";
import { accountServiceServer } from "src/services/AccountService";
import { jobServiceServer } from "src/services/JobService";
import { storageServiceServer } from "src/services/StorageService";
import { userServiceServer } from "src/services/UserService";

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

  await server.register(userServiceServer);
  await server.register(storageServiceServer);
  await server.register(accountServiceServer);
  await server.register(jobServiceServer);

  return server;
}
