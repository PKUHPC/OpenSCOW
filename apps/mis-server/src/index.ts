import { createServer } from "src/app";
import { createPriceItems } from "src/tasks/createBillingItems";
import { fetchJobs } from "src/tasks/fetch";
import { initializeUsers } from "src/tasks/initializeUsers";
import { migrationUp } from "src/tasks/migrationUp";

async function main() {

  const server = await createServer();

  const args = process.argv.slice(1);

  // run tasks
  if (args.length > 1) {
    const [_scriptName, command, ...rest] = args;

    const logger = server.logger.child({ task: command });

    const em = server.ext.orm.em.fork();

    switch (command) {

    case "initializeUsers":
      const whitelist = rest.includes("whitelist");
      await initializeUsers(em, whitelist, logger);
      break;

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
