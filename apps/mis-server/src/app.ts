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
import { updateBlockStatusInSlurm } from "src/bl/block";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { accountServiceServer } from "src/services/account";
import { adminServiceServer } from "src/services/admin";
import { chargingServiceServer } from "src/services/charging";
import { initServiceServer } from "src/services/init";
import { jobServiceServer } from "src/services/job";
import { jobChargeLimitServer } from "src/services/jobChargeLimit";
import { tenantServiceServer } from "src/services/tenant";
import { userServiceServer } from "src/services/user";

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

  server.logger.info({ version: readVersionFile() }, "@scow/mis-server: ");
  server.logger.info({ config: omitConfigSpec(config) }, "Loaded env config");

  for (const plugin of plugins) {
    await server.register(plugin);
  }
  await server.register(accountServiceServer);
  await server.register(userServiceServer);
  await server.register(adminServiceServer);
  await server.register(initServiceServer);
  await server.register(jobChargeLimitServer);
  await server.register(jobServiceServer);
  await server.register(chargingServiceServer);
  await server.register(tenantServiceServer);

  const em = server.ext.orm.em.fork();
  await updateBlockStatusInSlurm(em, server.ext.clusters, server.logger);

  return server;
}
