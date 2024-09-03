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

import { FilterQuery } from "@mikro-orm/mysql";
import { NoticeType } from "src/models/notice-type";
import { validateToken } from "src/server/auth/token";
import { Message, SenderType } from "src/server/entities/Message";
import { ReadStatus, TargetType, UserMessageRead } from "src/server/entities/UserMessageRead";

import { forkEntityManager } from "../get-orm";

export const hasUnreadMessage = async (token: string) => {
  const info = await validateToken(token);

  if (!info) {
    throw new Error("UNAUTHORIZED");
  }

  const em = await forkEntityManager();

  // 获取用户已读的消息ID列表
  const readMessages = await em.find(UserMessageRead, { userId: info.identityId });
  const readMessageIds = readMessages.map((read) => read.message.id);
  // 基础查询条件
  const targetConditions: FilterQuery<Message>[] = [
    { senderType: SenderType.PLATFORM_ADMIN }, // 管理员发送的消息必须要接收
    { messageTarget: { targetType: TargetType.FULL_SITE, noticeTypes: { $like: `%${NoticeType.SITE_MESSAGE}%` } } },
    { messageTarget: {
      targetType: TargetType.TENANT, targetId: info.tenant, noticeTypes: { $like: `%${NoticeType.SITE_MESSAGE}%` } } },
    { messageTarget: {
      targetType: TargetType.ACCOUNT,
      targetId: { $in: info.accountAffiliations.map((a) => a.accountName) },
      noticeTypes: { $like: `%${NoticeType.SITE_MESSAGE}%` },
    } },
    { messageTarget: {
      targetType: TargetType.USER,
      targetId: info.identityId,
      noticeTypes: { $like: `%${NoticeType.SITE_MESSAGE}%` },
    } },
  ];

  const unreadConditions: FilterQuery<Message>[] = [
    { id: { $nin: readMessageIds } },
    { userMessageRead: { status: ReadStatus.UNREAD, isDeleted: false } },
  ];


  const message = await em.findOne(Message, {
    $and: [
      { $or: targetConditions },
      { $or: unreadConditions },
    ],
  });

  if (message) return true;

  return false;
};

