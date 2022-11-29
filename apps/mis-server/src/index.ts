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

import { createServer } from "src/app";
import { createPriceItems } from "src/tasks/createBillingItems";
import { fetchJobs } from "src/tasks/fetch";
import { migrationUp } from "src/tasks/migrationUp";

async function main() {

  const server = await createServer();

  const args = process.argv.slice(1);

  // run tasks
  if (args.length > 1) {
    const [_scriptName, command] = args;

    const logger = server.logger.child({ task: command });

    const em = server.ext.orm.em.fork();

    switch (command) {

    case "fetchJobs":
      await fetchJobs(em, logger, server.ext, server.ext);
      break;

    case "createPriceItems":
      await createPriceItems(em, logger);
      break;

    case "migrationUp":
      await migrationUp(server.ext.orm);
      break;
    default:
      logger.error("Unexpected task name %s", command);
      process.exit(1);
    }

    process.exit(0);
  }

  await server.start();
}

main();
