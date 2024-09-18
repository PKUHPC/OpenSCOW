/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { operationLogServiceServer } from "src/services/operationLog";
import { statisticServiceServer } from "src/services/statistic";
import { loggerOptions } from "src/utils/logger";

export async function createServer() {

  const server = new Server({
    host: config.HOST,
    port: config.PORT,

    logger: loggerOptions,
  });

  server.logger.info({ version: readVersionFile() }, "@scow/audit-server: ");
  server.logger.info({ config: omitConfigSpec(config) }, "Loaded env config");

  for (const plugin of plugins) {
    await server.register(plugin);
  }
  await server.register(operationLogServiceServer);
  await server.register(statisticServiceServer);
  return server;
}
