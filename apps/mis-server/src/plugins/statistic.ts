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

import { plugin } from "@ddadaal/tsgrpc-server";
import cron from "node-cron";
import { fetchStatistics, lastFetched } from "src/tasks/statistic";

export interface StatisticPlugin {
  fetch: {
    started: () => boolean;
    start: () => void;
    stop: () => void;
    schedule: string;
    lastFetched: () => Date | null;
    fetch: () => Promise<{ fetchSuccsess: boolean }>;
  }
}

export const statisticPlugin = plugin(async (f) => {

  let statisticStarted = true;
  let statisticIsRunning = false;

  const logger = f.logger.child({ plugin: "statistic" });

  const trigger = () => {
    if (statisticIsRunning) return;

    statisticIsRunning = true;
    return fetchStatistics(f.ext.orm.em.fork(), logger).finally(() => { statisticIsRunning = false; });
  };

  const task = cron.schedule(
    "1 0 * * *",
    () => { void trigger(); },
    {
      timezone: "Asia/Shanghai",
      scheduled: true,
    },
  );

  logger.info("Fetch info started.");

  f.addCloseHook(() => {
    task.stop();
    logger.info("Fetch info stopped.");
  });

  f.addExtension("statistics", ({
    started: () => statisticStarted,
    start: () => {
      if (statisticStarted) {
        logger.info("Statistic is requested to start but already started");
      } else {
        task.start();
        statisticStarted = true;
        logger.info("Statistic started");
      }
    },
    stop: () => {
      if (!statisticStarted) {
        logger.info("Statistic is requested to stop but already stopped");
      } else {
        task.stop();
        statisticStarted = false;
        logger.info("Statistic stopped");
      }
    },
    schedule: "1 0 * * *",
    lastFetched: () => lastFetched,
    fetch: trigger,
  } as StatisticPlugin["fetch"]));
});
