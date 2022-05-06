import { WORKER_MARKER } from "src/plugins/worker";
import { runWorker } from "src/worker";

// find WORKER_MARKER from argv

const index = process.argv.indexOf(WORKER_MARKER);

if (index >= 0) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  runWorker(process.argv.slice(index+1));
}

import { buildApp, startServer } from "src/app";


const server = buildApp();

startServer(server);

