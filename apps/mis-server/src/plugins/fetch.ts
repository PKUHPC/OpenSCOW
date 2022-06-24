import { plugin } from "@ddadaal/tsgrpc-server";
import cron from "node-cron";
import { config } from "src/config/env";
import { fetchJobs, lastFetched } from "src/tasks/fetch";

export interface FetchPlugin {
  fetch: {
    started: () => boolean;
    start: () => void;
    stop: () => void;
    schedule: string;
    lastFetched: () => Date | null;
    fetch: () => Promise<{ newJobsCount: number }>;
  }
}

export const fetchPlugin = plugin(async (f) => {

  let fetchStarted = config.FETCH_JOBS_PERIODIC_FETCH_ENABLED;

  const logger = f.logger.child({ plugin: "fetch" });

  const trigger = () => fetchJobs(f.ext.orm.em.fork(), logger, f.ext, f.ext);

  const task = cron.schedule(
    config.FETCH_JOBS_PERIODIC_FETCH_CRON,
    trigger,
    {
      timezone: "Asia/Shanghai",
      scheduled: config.FETCH_JOBS_PERIODIC_FETCH_ENABLED,
    },
  );

  logger.info("Fetch info started.");

  f.addCloseHook(() => {
    task.stop();
    logger.info("Fetch info stopped.");
  });

  f.addExtension("fetch", <FetchPlugin["fetch"]>{
    started: () => fetchStarted,
    start: () => {
      if (fetchStarted) {
        logger.info("Fetch is requested to start but already started");
      } else {
        task.start();
        fetchStarted = true;
        logger.info("Fetch started");
      }
    },
    stop: () => {
      if (!fetchStarted) {
        logger.info("Fetch is requested to stop but already stopped");
      } else {
        task.stop();
        fetchStarted = false;
        logger.info("Fetch stopped");
      }
    },
    schedule: config.FETCH_JOBS_PERIODIC_FETCH_CRON,
    lastFetched: () => lastFetched,
    fetch: trigger,
  });
});
