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

import { Server } from "@ddadaal/tsgrpc-server";
import { omitConfigSpec } from "@scow/lib-config";
import { readVersionFile } from "@scow/utils/build/version";
import { clusters } from "src/config/clusters";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { appServiceServer } from "src/services/app";
import { configServiceServer } from "src/services/config";
import { desktopServiceServer } from "src/services/desktop";
import { fileServiceServer } from "src/services/file";
import { jobServiceServer } from "src/services/job";
import { shellServiceServer } from "src/services/shell";
import { logger } from "src/utils/logger";
import { setupProxyGateway } from "src/utils/proxy";
import { initShellFile } from "src/utils/shell";
import { checkClustersRootUserLogin } from "src/utils/ssh";

export async function createServer() {

  const server = new Server({
    host: config.HOST,
    port: config.PORT,
    logger,
  });

  server.logger.info({ version: readVersionFile() }, "Running @scow/portal-server");
  server.logger.info({ config: omitConfigSpec(config) }, "Loaded env config");

  for (const plugin of plugins) {
    await server.register(plugin);
  }

  await server.register(appServiceServer);
  await server.register(desktopServiceServer);
  await server.register(jobServiceServer);
  await server.register(fileServiceServer);
  await server.register(shellServiceServer);
  await server.register(configServiceServer);

  if (process.env.NODE_ENV === "production") {
    await checkClustersRootUserLogin(server.logger);
    await Promise.all(Object.entries(clusters).map(async ([id]) => {
      await initShellFile(id, server.logger);
    }));
    await setupProxyGateway(server.logger);
  }



  return server;
}
