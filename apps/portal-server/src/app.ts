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
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { appServiceServer } from "src/services/app";
import { desktopServiceServer } from "src/services/desktop";
import { fileServiceServer } from "src/services/file";
import { jobServiceServer } from "src/services/job";
import { shellServiceServer } from "src/services/shell";
import { checkClustersRootUserLogin } from "src/utils/ssh";

export async function createServer() {

  const server = new Server({
    host: config.HOST,
    port: config.PORT,
    logger: {
      level: config.LOG_LEVEL,
      ...config.LOG_PRETTY ? {
        transport: { target: "pino-pretty" },
      } : {},
    },
  });

  server.logger.info("@scow/portal-server: ", readVersionFile());
  server.logger.info({ config: omitConfigSpec(config) }, "Loaded env config");

  for (const plugin of plugins) {
    await server.register(plugin);
  }

  await server.register(appServiceServer);
  await server.register(desktopServiceServer);
  await server.register(jobServiceServer);
  await server.register(fileServiceServer);
  await server.register(shellServiceServer);

  if (process.env.NODE_ENV === "production") {
    await checkClustersRootUserLogin(server.logger);
  }

  return server;
}
