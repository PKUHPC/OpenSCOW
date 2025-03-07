import { Server } from "@ddadaal/tsgrpc-server";
import { omitConfigSpec } from "@scow/lib-config";
import { libGetCurrentActivatedClusters } from "@scow/lib-server";
import { readVersionFile } from "@scow/utils/build/version";
import { configClusters } from "src/config/clusters";
import { commonConfig } from "src/config/common";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { appServiceServer } from "src/services/app";
import { runtimeConfigServiceServer, staticConfigServiceServer } from "src/services/config";
import { dashboardServiceServer } from "src/services/dashboard";
import { desktopServiceServer } from "src/services/desktop";
import { fileServiceServer } from "src/services/file";
import { jobServiceServer } from "src/services/job";
import { shellServiceServer } from "src/services/shell";
import { checkClusters } from "src/utils/clusters";
import { loggerOptions } from "src/utils/logger";
import { setupProxyGateway } from "src/utils/proxy";
import { initShellFile } from "src/utils/shell";

export async function createServer() {

  const server = new Server({
    host: config.HOST,
    port: config.PORT,
    logger: loggerOptions,
  });

  server.logger.info({ version: readVersionFile() }, "Running @scow/portal-server");
  server.logger.info({ config: omitConfigSpec(config) }, "Loaded env config");

  for (const plugin of plugins) {
    await server.register(plugin);
  }

  await server.register(appServiceServer);
  await server.register(jobServiceServer);
  await server.register(shellServiceServer);
  await server.register(staticConfigServiceServer);
  await server.register(runtimeConfigServiceServer);
  await server.register(dashboardServiceServer);
  await server.register(fileServiceServer);
  await server.register(desktopServiceServer);

  if (process.env.NODE_ENV === "production") {
    const activatedClusters = await libGetCurrentActivatedClusters(
      server.logger,
      configClusters,
      config.MIS_SERVER_URL,
      commonConfig.scowApi?.auth?.token);

    await checkClusters(server.logger, activatedClusters);
    await Promise.all(Object.entries(activatedClusters).map(async ([id, config]) => {
      if (config.scowd?.enabled) {
        server.logger.info(`The scowd of cluster ${id} is already enabled, skipping initShellFile.`);
        return;
      }
      await initShellFile(id, server.logger);
    }));
    await setupProxyGateway(server.logger, activatedClusters);
  }

  return server;
}
