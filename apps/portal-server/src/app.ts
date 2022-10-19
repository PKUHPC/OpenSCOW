import { Server } from "@ddadaal/tsgrpc-server";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { appServiceServer } from "src/services/app";
import { desktopServiceServer } from "src/services/desktop";
import { fileServiceServer } from "src/services/file";
import { jobServiceServer } from "src/services/job";
import { shellServiceServer } from "src/services/shell";

export async function createServer() {

  const server = new Server({
    host: config.HOST,
    port: config.PORT,
    logger: { level: config.LOG_LEVEL },
  });

  for (const plugin of plugins) {
    await server.register(plugin);
  }

  await server.register(appServiceServer);
  await server.register(desktopServiceServer);
  await server.register(jobServiceServer);
  await server.register(fileServiceServer);
  await server.register(shellServiceServer);

  return server;
}
