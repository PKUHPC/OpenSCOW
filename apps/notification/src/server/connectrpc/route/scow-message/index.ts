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

import { Struct } from "@bufbuild/protobuf";
import { Code, ConnectError, ConnectRouter } from "@connectrpc/connect";
import { FilterQuery } from "@mikro-orm/core";
import { ReadStatus } from "@scow/notification-protos/build/common_pb";
import { ScowMessageService } from "@scow/notification-protos/build/scow_message_connect";
import { NoticeType } from "src/models/notice-type";
import { notificationConfig } from "src/server/config/notification";
import { Message, SenderType } from "src/server/db/entities/Message";
import { MessageTarget } from "src/server/db/entities/MessageTarget";
import { ReadStatus as EntityReadStatus, TargetType, UserMessageRead } from "src/server/db/entities/UserMessageRead";
import { UserSubscription } from "src/server/db/entities/UserSubscription";
import { getUser } from "src/utils/auth";
import { checkAuth } from "src/utils/auth/check-auth";
import { ensureNotUndefined } from "src/utils/ensure-not-undefined";
import { forkEntityManager } from "src/utils/get-orm";
import { logger } from "src/utils/logger";
import { systemSendMsgToBridge } from "src/utils/message-bridge";
import { getMessageConfigWithDefault } from "src/utils/message-config";
import { checkMessageTypeExist, getMessagesTypeData } from "src/utils/message-type";
import { paginationProps } from "src/utils/pagination";

export default (router: ConnectRouter) => {
  router.service(ScowMessageService, {
    async systemSendMessage(req) {
      const { systemId, targetIds, messageType, metadata, descriptionData } = req;
      const { targetType } = ensureNotUndefined(req, ["targetType"]);

      if (!metadata) {
        throw new ConnectError(
          "The metadata field cannot be empty",
          Code.InvalidArgument,
        );
      }

      const em = await forkEntityManager();

      const messageTypeData = await checkMessageTypeExist(em, messageType);
      if (!messageTypeData) {
        throw new ConnectError(
          `Message type ${messageType} does't exists.`,
          Code.InvalidArgument,
        );
      }

      // TODO: check system id
      const message = new Message({
        senderType: SenderType.SYSTEM,
        senderId: systemId,
        targetType,
        messageType,
        category: messageTypeData.category,
        metadata: metadata.toJson() as Record<string, string>,
        descriptionData,
      });

      await em.persistAndFlush(message);

      const adminMessageConfig = await getMessageConfigWithDefault(em, messageType, NoticeType.SITE_MESSAGE);

      for (const userId of targetIds) {
        // 只有管理员开启了该消息且允许用户修改才按照用户订阅来处理
        const userSubscription = adminMessageConfig?.canUserModify && adminMessageConfig.enabled
          ? await em.findOne(UserSubscription, { userId, messageType, noticeType: NoticeType.SITE_MESSAGE })
          : undefined;
        // 检查用户是否订阅该类型, 站内消息必须要接收
        const messageEnabled = userSubscription?.isSubscribed || adminMessageConfig.enabled;

        if (messageEnabled) {
          const messageTarget = new MessageTarget({
            noticeTypes: [NoticeType.SITE_MESSAGE],
            targetId: userId,
            targetType: TargetType.USER,
            message,
          });
          await em.persistAndFlush(messageTarget);
        }
      }

      if (notificationConfig.messageBridge) {
        systemSendMsgToBridge(em, {
          senderType: SenderType.SYSTEM, senderId: systemId,
          category: messageTypeData.category,
          targetType, targetIds, messageType,
          metadata,
        });
      }

      return;
    },

    async listMessages(req, context) {
      const { userId, category, noticeType, messageType, readStatus, page, pageSize } = req;

      const user = userId ? await getUser(userId, logger) : await checkAuth(context);

      if (!user) {
        throw new ConnectError("user does not exists.", Code.InvalidArgument);
      }

      const em = await forkEntityManager();

      // 获取用户已读的消息ID列表
      const readMessages = await em.find(UserMessageRead, { userId: user.identityId });
      const readMessageIds = readMessages.map((read) => read.message.id);

      // 基础查询条件
      const targetConditions: FilterQuery<Message>[] = [
        { senderType: SenderType.PLATFORM_ADMIN }, // 管理员发送的消息必须要接收
        { messageTarget: { targetType: TargetType.FULL_SITE, noticeTypes: { $like: `%${noticeType}%` } } },
        { messageTarget: {
          targetType: TargetType.TENANT, targetId: user.tenant, noticeTypes: { $like: `%${noticeType}%` } } },
        { messageTarget: { targetType: TargetType.ACCOUNT, targetId:
          { $in: user.accountAffiliations.map((a) => a.accountName) }, noticeTypes: { $like: `%${noticeType}%` } } },
        { messageTarget: {
          targetType: TargetType.USER, targetId: user.identityId, noticeTypes: { $like: `%${noticeType}%` } } },
      ];

      // 根据 readStatus 枚举值添加不同的查询条件
      let readConditions: FilterQuery<Message>[] = [];
      switch (readStatus) {
        case ReadStatus.UNREAD:
          readConditions = [
            { id: { $nin: readMessageIds } },
            { userMessageRead: { userId: user.identityId, status: EntityReadStatus.UNREAD, isDeleted: false } },
          ];
          break;
        case ReadStatus.READ:
          readConditions = [
            { userMessageRead: { userId: user.identityId, status: EntityReadStatus.READ, isDeleted: false } },
          ];
          break;
        default:
          // 如果是 ALL 或未指定 readStatus，则不添加额外条件
          readConditions = [
            { id: { $nin: readMessageIds } },
            { userMessageRead: { userId: user.identityId, isDeleted: false } },
          ];
          break;
      }

      const messageTypeCondition: Record<string, any> = {};
      if (messageType) messageTypeCondition.type = messageType;

      // 发送消息时已经过滤了用户未订阅的消息，所以无需在查询时再过滤
      const [messages, totalCount] = await em.findAndCount(Message, {
        ...category ? { category } : {},
        $and: [
          { messageType: messageTypeCondition },
          { $or: targetConditions },
          { $or: readConditions },
        ],
      }, {
        ...paginationProps(page, pageSize),
        populate: ["messageType", "userMessageRead"],
        orderBy: { "createdAt": "DESC" },
      });

      const messagesTypeDataMap = await getMessagesTypeData(em, messages);

      return {
        totalCount: BigInt(totalCount),
        messages: messages.filter((m) => messagesTypeDataMap.has(m.messageType)).map((m) => ({
          ...m,
          id: BigInt(m.id),
          metadata: Struct.fromJson(m.metadata),
          messageType: messagesTypeDataMap.get(m.messageType)!,
          isRead: m.userMessageRead.$.find(
            (item) => item.userId === user.identityId)?.status === ReadStatus.READ ? true : false,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        })),
      };
    },

    async markMessageRead(req, context) {
      const { userId, messageId } = req;

      const user = userId ? await getUser(userId, logger) : await checkAuth(context);
      if (!user) {
        throw new ConnectError(`user ${userId} does not exists.`, Code.InvalidArgument);
      }

      const em = await forkEntityManager();

      // 检查这条消息是否是发给该用户的
      const message = await em.findOne(Message, {
        id: Number(messageId),
        $or: [
          { messageTarget: { targetType: TargetType.FULL_SITE } },
          { messageTarget: { targetType: TargetType.TENANT, targetId: user.tenant } },
          { messageTarget: { targetType: TargetType.ACCOUNT, targetId:
          { $in: user.accountAffiliations.map((a) => a.accountName) } } },
          { messageTarget: { targetType: TargetType.USER, targetId: user.identityId } },
        ],
      });

      if (!message) {
        throw new ConnectError(
          `User ${user.identityId} can't read message ${messageId}`,
          Code.PermissionDenied,
        );
      }

      const userReadRecord = await em.findOne(UserMessageRead, {
        userId: user.identityId, message: { id: Number(messageId) } });

      if (!userReadRecord) {
        const newReadRecord = new UserMessageRead({
          userId: user.identityId, message, readTime: new Date(), status: EntityReadStatus.READ });

        await em.persistAndFlush(newReadRecord);
        // await deleteKeys([`${unreadMessageCountPrefixKey}${user.identityId}`]);

        return {
          ...newReadRecord,
          messageId: message.id,
          readTime: newReadRecord.readTime?.toISOString() ?? new Date().toISOString(),
          createdAt: newReadRecord.createdAt.toISOString(),
          updatedAt: newReadRecord.updatedAt.toISOString(),
        };
      } else {
        if (userReadRecord.status === EntityReadStatus.UNREAD) {
          userReadRecord.status = EntityReadStatus.READ;
          userReadRecord.readTime = new Date();
          await em.persistAndFlush(userReadRecord);
        }

        // await deleteKeys([`${unreadMessageCountPrefixKey}${user.identityId}`]);
        return {
          ...userReadRecord,
          messageId: message.id,
          readTime: userReadRecord.readTime?.toISOString() ?? new Date().toISOString(),
          createdAt: userReadRecord.createdAt.toISOString(),
          updatedAt: userReadRecord.updatedAt.toISOString(),
        };
      }
    },
  });
};
