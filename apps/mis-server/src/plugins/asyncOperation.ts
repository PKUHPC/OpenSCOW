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

import { Plugin, plugin } from "@ddadaal/tsgrpc-server";
import { AsyncOperationSchema } from "@scow/config/build/mis";
import cron from "node-cron";
import { initAsyncOperationHandler } from "src/asyncOperations/handlers";
import { execAsyncOperation, lastExec } from "src/tasks/asyncOperation";

export interface AsyncOperationPlugin {
  asyncOperation: {
    started: () => boolean;
    start: () => void;
    stop: () => void;
    schedule: string;
    lastExec: () => Date | null;
    exec: () => Promise<void>;
  }
}

export const asyncOperationPlugin = (config: AsyncOperationSchema): Plugin => { 
  return plugin(async (f) => {

    let execStarted = !!config.periodicExec;
    let execIsRunning = false;

    const logger = f.logger.child({ plugin: "asyncOperation" });

    // 初始化异步操作处理器
    initAsyncOperationHandler();

    const trigger = () => {
      if (execIsRunning) return;

      execIsRunning = true;
      return execAsyncOperation(f.ext.orm.em.fork(), logger, f.ext).finally(() => { execIsRunning = false; });
    };

    const task = cron.schedule(
      config.periodicExec.cron,
      trigger,
      {
        timezone: "Asia/Shanghai",
        scheduled: true,
      },
    );

    logger.info("Exec async operations started.");

    f.addCloseHook(() => {
      task.stop();
      logger.info("Exec async operation stopped.");
    });

    f.addExtension("asyncOperation", <AsyncOperationPlugin["asyncOperation"]>{
      started: () => execStarted,
      start: () => {
        if (execStarted) {
          logger.info("Exec async operation is requested to start but already started");
        } else {
          task.start();
          execStarted = true;
          logger.info("Exec async operation started");
        }
      },
      stop: () => {
        if (!execStarted) {
          logger.info("Exec async operation is requested to stop but already stopped");
        } else {
          task.stop();
          execStarted = false;
          logger.info("Exec async operation stopped");
        }
      },
      schedule: config.periodicExec.cron,
      lastExec: () => lastExec,
      exec: trigger,
    });
  });
};
