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
import { SyncBlockStatusResponse } from "@scow/protos/build/server/admin";
import cron from "node-cron";
import { misConfig } from "src/config/mis";
import { lastSyncTime, synchronizeBlockStatus } from "src/tasks/syncBlockStatus";

export interface SyncBlockStatusPlugin {
  syncBlockStatus: {
    started: () => boolean;
    start: () => void;
    stop: () => void;
    schedule: string;
    lastSyncTime: () => Date | null;
    sync: () => Promise<SyncBlockStatusResponse>;
  }
}

export const syncBlockStatusPlugin = plugin(async (f) => {
  const synchronizeCron = misConfig.periodicSyncUserAccountBlockStatus?.cron ?? "0 4 * * *";
  let synchronizeStarted = !!misConfig.periodicSyncUserAccountBlockStatus?.enabled;
  let synchronizeIsRunning = false;

  const logger = f.logger.child({ plugin: "syncBlockStatus" });
  logger.info("misConfig.periodicSyncStatus?.cron: %s", misConfig.periodicSyncUserAccountBlockStatus?.cron);

  const trigger = () => {
    if (synchronizeIsRunning) return;

    synchronizeIsRunning = true;
    return synchronizeBlockStatus(f.ext.orm.em.fork(), logger, f.ext)
      .finally(() => { synchronizeIsRunning = false; });
  };

  const task = cron.schedule(
    synchronizeCron,
    () => { void trigger(); },
    {
      timezone: "Asia/Shanghai",
      scheduled: misConfig.periodicSyncUserAccountBlockStatus?.enabled,
    },
  );

  logger.info("Sync block status started.");

  f.addCloseHook(() => {
    task.stop();
    logger.info("Sync block status stopped.");
  });

  f.addExtension("syncBlockStatus", ({
    started: () => synchronizeStarted,
    start: () => {
      if (synchronizeStarted) {
        logger.info("Sync is requested to start but already started");
      } else {
        task.start();
        synchronizeStarted = true;
        logger.info("Sync started");
      }
    },
    stop: () => {
      if (!synchronizeStarted) {
        logger.info("Sync is requested to stop but already stopped");
      } else {
        task.stop();
        synchronizeStarted = false;
        logger.info("Sync stopped");
      }
    },
    schedule: synchronizeCron,
    lastSyncTime: () => lastSyncTime,
    sync: trigger,
  } as SyncBlockStatusPlugin["syncBlockStatus"]));
});
