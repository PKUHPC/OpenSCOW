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
import { config } from "src/config/env";
import { accountServiceServer } from "src/services/account";
import { configServiceServer } from "src/services/config";
import { jobServiceServer } from "src/services/job";
import { userServiceServer } from "src/services/user";
import { versionServiceServer } from "src/services/version";

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

  await server.register(accountServiceServer);
  await server.register(userServiceServer);
  await server.register(jobServiceServer);
  await server.register(configServiceServer);
  await server.register(versionServiceServer);

  return server;

}
