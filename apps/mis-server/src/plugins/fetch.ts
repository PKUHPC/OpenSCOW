import { plugin } from "@ddadaal/tsgrpc-server";
import cron from "node-cron";
import { config } from "src/config";
import { fetchJobs } from "src/tasks/fetch";

export interface FetchPlugin {
}

export const fetchPlugin = plugin(async (f) => {

  const logger = f.logger.child({ plugin: "fetch" });

  const task = cron.schedule(
    config.FETCH_JOBS_PERIODIC_FETCH_CRON,
    () => fetchJobs(f.ext.orm.em.fork(), logger, f.ext, f.ext), {
      timezone: "Asia/Shanghai",
      scheduled: config.FETCH_JOBS_PERIODIC_FETCH_ENABLED,
    },
  );

  logger.info("Fetch info started.");

  f.addCloseHook(() => {
    task.stop();
    logger.info("Fetch info stopped.");
  });
});
