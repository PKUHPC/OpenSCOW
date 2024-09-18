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
    run: () => Promise<SyncBlockStatusResponse | undefined>;
  }
}

export const syncBlockStatusPlugin = plugin(async (f) => {
  const synchronizeCron = misConfig.periodicSyncUserAccountBlockStatus?.cron ?? "0 4 * * *";
  let synchronizeEnabled = !!misConfig.periodicSyncUserAccountBlockStatus?.enabled;
  let synchronizeIsRunning = false;

  const logger = f.logger.child({ plugin: "syncBlockStatus" });
  logger.info("misConfig.periodicSyncStatus?.cron: %s", misConfig.periodicSyncUserAccountBlockStatus?.cron);

  const trigger = async () => {

    const sublogger = logger.child({ time: new Date() });

    if (synchronizeIsRunning) {
      sublogger.info("Sync is already running.");
      return Promise.resolve(undefined);
    }

    synchronizeIsRunning = true;
    sublogger.info("Sync starts to run.");

    try {
      return await synchronizeBlockStatus(f.ext.orm.em.fork(), sublogger, f.ext);
    } finally {
      synchronizeIsRunning = false;
    }
  };

  const task = cron.schedule(
    synchronizeCron,
    () => { void trigger(); },
    {
      timezone: "Asia/Shanghai",
      scheduled: synchronizeEnabled,
    },
  );

  logger.info("Sync block status started.");

  f.addCloseHook(() => {
    task.stop();
    logger.info("Sync block status stopped.");
  });

  f.addExtension("syncBlockStatus", ({
    started: () => synchronizeEnabled,
    start: () => {
      logger.info("Sync is started");
      synchronizeEnabled = true;
      task.start();
    },
    stop: () => {
      logger.info("Sync is started");
      synchronizeEnabled = false;
      task.stop();
    },
    schedule: synchronizeCron,
    lastSyncTime: () => lastSyncTime,
    run: trigger,
  } satisfies SyncBlockStatusPlugin["syncBlockStatus"]));

  if (synchronizeEnabled) {
    logger.info("Started a new synchronization");
    void trigger();
  } else {
    logger.info("Account/Account block sychronization is disabled.");
  }
});
