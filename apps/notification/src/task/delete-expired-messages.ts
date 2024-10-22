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
  logger.info("starting delete messages");

  const deletedMessageIds: bigint[] = [];
  const em = await forkEntityManager();
  // 1. 获取所有的消息
  const messages = await em.findAll(Message, {});

  // 使用 Map 缓存查询过的 messageConfig
  const messageConfigCache = new Map<string, AdminMessageConfig | null>();

  // 2. 遍历所有的消息判断是否需要删除
  for (const msg of messages) {
    // 缓存中找不到，才查询数据库
    let messageConfig = messageConfigCache.get(msg.messageType);

    if (!messageConfig && !messageConfigCache.has(msg.messageType)) {
      messageConfig = await em.findOne(AdminMessageConfig, { messageType: msg.messageType });
      messageConfigCache.set(msg.messageType, messageConfig);
    }

    if (!msg.expiredAt && !checkAdminMessageTypeExist(msg.messageType)) { // 无过期时间的按照消息设置的过期时间删除
      if (messageConfig?.expiredAfterSeconds) {
        const expiredDate = dayjs(msg.createdAt).add(Number(messageConfig.expiredAfterSeconds), "seconds").toDate();

        if (expiredDate <= new Date()) {
          em.remove(msg);
          deletedMessageIds.push(msg.id);
        }
      }
    } else if (msg.expiredAt && msg.expiredAt <= new Date()) { // 有过期时间的按过期时间处理
      em.remove(msg);
      deletedMessageIds.push(msg.id);
    }
  }

  await em.flush();
  logger.info(`This round of deleting expired messages is completed, delete: ${deletedMessageIds.toString()}`);

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
