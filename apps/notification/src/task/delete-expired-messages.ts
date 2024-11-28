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

import dayjs from "dayjs";
import cron from "node-cron";
import { notificationConfig } from "src/server/config/notification";
import { AdminMessageConfig } from "src/server/entities/AdminMessageConfig";
import { Message } from "src/server/entities/Message";
import { forkEntityManager } from "src/utils/get-orm";
import { logger } from "src/utils/logger";
import { checkAdminMessageTypeExist } from "src/utils/rendering-message";

let deleteIsRunning = false;

export async function deleteExpiredMessages() {
  logger.info("Starting delete expired messages");

  const deletedMessageIds: bigint[] = [];
  const em = await forkEntityManager();

  // 使用 Map 缓存查询过的 messageConfig
  const messageConfigCache = new Map<string, AdminMessageConfig | null>();

  // 每次处理的消息数量（可以根据实际情况调整）
  const batchSize = 100;
  let page = 0;

  // 逐页处理消息，避免一次性加载太多数据
  while (true) {
    // 分页查询消息
    const messages = await em.find(Message, {}, {
      fields: ["id", "expiredAt", "createdAt", "messageType"],
      limit: batchSize,
      offset: page * batchSize,
    });

    // 如果没有更多消息，结束循环
    if (messages.length === 0) {
      break;
    }

    // 遍历当前批次的消息
    for (const msg of messages) {
      let messageConfig = messageConfigCache.get(msg.messageType);

      // 缓存中找不到，才查询数据库
      if (!messageConfig && !messageConfigCache.has(msg.messageType)) {
        messageConfig = await em.findOne(AdminMessageConfig, { messageType: msg.messageType });
        messageConfigCache.set(msg.messageType, messageConfig);
      }

      // 逻辑判断删除过期消息
      if (!msg.expiredAt && !checkAdminMessageTypeExist(msg.messageType)) {
        // 无过期时间的，按照消息配置的过期时间删除
        if (messageConfig?.expiredAfterSeconds) {
          const expiredDate = dayjs(msg.createdAt)
            .add(Number(messageConfig.expiredAfterSeconds), "seconds")
            .toDate();

          if (expiredDate <= new Date()) {
            em.remove(msg);
            deletedMessageIds.push(msg.id);
          }
        }
      } else if (msg.expiredAt && msg.expiredAt <= new Date()) {
        // 有过期时间的，按过期时间删除
        em.remove(msg);
        deletedMessageIds.push(msg.id);
      }
    }

    // 每处理完一批数据就执行一次 flush，减少内存占用
    await em.flush();
    page++;
  }

  logger.info(`This round of deleting expired messages is completed, deleted: ${deletedMessageIds.toString()}`);
  return;
}

const trigger = async () => {
  if (deleteIsRunning) return;

  deleteIsRunning = true;
  try {
    await deleteExpiredMessages();
  } finally {
    deleteIsRunning = false;
  }
};

const task = cron.schedule(
  notificationConfig.deleteExpiredMessages.cron,
  () => {
    trigger().catch((error) => {
      console.error("Error deleting expired message:", error);
    });
  },
  {
    timezone: "Asia/Shanghai",
    scheduled: true,
  },
);

export const startDeleteExpiredMessages = () => {
  task.start();
  logger.info("The timer for deleting expired messages has started");
};

export const stopDeleteExpiredMessages = () => {
  task.stop();
  logger.info("The timer for deleting expired messages has stopped");
};
