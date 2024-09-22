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

import { SqlEntityManager } from "@mikro-orm/mysql";
import { getNotificationNodeClient } from "@scow/lib-notification/build/index";
import { NoticeType,SenderType, TargetType } from "@scow/notification-protos/build/common_pb";
import { notificationConfig } from "src/server/config/notification";

import { fetchAllUsers } from "./auth/get-user";
import { logger } from "./logger";
import { getMessageTypeData } from "./message-type";
import { getUserNotificationPreferences } from "./notice-type";
import { replaceTemplate } from "./rendering-message";

interface AdminSendMsgToBridge {
  senderType: SenderType;
  senderId: string;
  targetType: TargetType;
  targetIds: string[];
  title: string;
  content: string;
  messageType: string;
  category: string
  noticeTypes: NoticeType[]
}

interface SystemSendMsgToBridge {
  senderType: SenderType;
  senderId: string;
  targetType: TargetType;
  targetIds: string[];
  messageType: string;
  category: string;
  metadata: Record<string, any>;
}

export async function adminSendMsgToBridge(info: AdminSendMsgToBridge) {
  if (!notificationConfig.messageBridge) {
    return;
  }
  const client = getNotificationNodeClient(notificationConfig.messageBridge.address);

  const { title, content, messageType, category, senderType, senderId, targetType, targetIds, noticeTypes } = info;

  if (targetType === TargetType.USER) {
    const usersInfo = await fetchAllUsers(targetIds, logger);

    usersInfo.forEach(async (info) => {
      if (info === undefined) {
        return;
      }

      await client.messageBridge.sendMessage({
        messageInfo: { title, content },
        messageTypeInfo: { type: messageType, category },
        senderInfo: { senderType, senderId },
        targetInfo: { targetType, userInfo: {
          userId: info?.identityId, name: info?.name, email: info?.email,
        } },
        noticeTypes,
      });

    });
  } else {
    await client.messageBridge.sendMessage({
      messageInfo: { title, content },
      messageTypeInfo: { type: messageType, category },
      senderInfo: { senderType, senderId },
      targetInfo: { targetType },
      noticeTypes,
    });
  }

}

export async function systemSendMsgToBridge(em: SqlEntityManager, info: SystemSendMsgToBridge) {
  if (!notificationConfig.messageBridge) {
    return;
  }
  const client = getNotificationNodeClient(notificationConfig.messageBridge.address);

  const { messageType, category, senderType, senderId, targetType, targetIds, metadata } = info;

  const usersInfo = await fetchAllUsers(targetIds, logger);

  usersInfo.forEach(async (info) => {
    if (info === undefined) {
      return;
    }

    // 查询 messageType 的模板信息
    const messageTypeData = await getMessageTypeData(em, messageType);
    // 获取当前用户接收的 notice type
    const noticeTypes = await getUserNotificationPreferences(em, info.identityId, messageType);

    await client.messageBridge.sendMessage({
      messageInfo: {
        title: messageTypeData.titleTemplate.default ?? "",
        content: messageTypeData.contentTemplate
          ? replaceTemplate(metadata.toJson(), messageTypeData.contentTemplate.default) : "",
        metadata,
      },
      messageTypeInfo: { type: messageType, category },
      senderInfo: { senderType, senderId },
      targetInfo: { targetType, userInfo: {
        userId: info?.identityId, name: info?.name, email: info?.email,
      } },
      noticeTypes,
    });
  });
}
