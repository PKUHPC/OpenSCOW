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
import { MessageService } from "@scow/notification-protos/build/message_connect";
import { PlatformRole } from "src/models/user";
import { notificationConfig } from "src/server/config/notification";
import { Message, SenderType } from "src/server/entities/Message";
import { MessageTarget } from "src/server/entities/MessageTarget";
import { ReadStatus as EntityReadStatus, TargetType, UserMessageRead } from "src/server/entities/UserMessageRead";
import { getUser } from "src/utils/auth";
import { checkAuth } from "src/utils/auth/check-auth";
import { ensureNotUndefined } from "src/utils/ensure-not-undefined";
import { forkEntityManager } from "src/utils/get-orm";
import { logger } from "src/utils/logger";
import { adminSendMsgToBridge } from "src/utils/message-bridge";
import { getMessagesTypeData } from "src/utils/message-type";
import { paginationProps } from "src/utils/pagination";
import { checkAdminMessageTypeExist } from "src/utils/rendering-message";

export default (router: ConnectRouter) => {
  router.service(MessageService, {
    async adminSendMessage(req, context) {
      const { targetIds, noticeTypes, messageType, title, content } = req;
      const { targetType } = ensureNotUndefined(req, ["targetType"]);

      const user = await checkAuth(context);

      if (!user.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)) {
        throw new ConnectError(
          `User ${user.identityId} unable to send message.`,
          Code.PermissionDenied,
        );
      }

      const em = await forkEntityManager();

      const messageTypeData = checkAdminMessageTypeExist(messageType);
      if (!messageTypeData) {
        throw new ConnectError(
          `Message type ${messageType} does't exists.`,
          Code.InvalidArgument,
        );
      }

      if (title.length > 20 || content.length > 150) {
        throw new ConnectError(
          "The title length should be less than 20 characters, "
            + "and the content length should be less than 150 characters.",
          Code.InvalidArgument,
        );
      }

      const message = new Message({
        senderType: SenderType.PLATFORM_ADMIN,
        senderId: user.identityId,
        targetType,
        messageType,
        category: messageTypeData.category,
        metadata: { title, content },
      });

      await em.persistAndFlush(message);

      if (targetType !== TargetType.USER) {
        if (targetType === TargetType.FULL_SITE) {
          const messageTarget = new MessageTarget({
            targetType,
            noticeTypes,
            message,
          });

          await em.persistAndFlush([messageTarget]);
        } else {
          for (const targetId of targetIds) {
            const messageTarget = new MessageTarget({
              targetType,
              targetId,
              noticeTypes,
              message,
            });

            em.persist(messageTarget);
          }
          await em.flush();
        }
      }

      if (notificationConfig.messageBridge) {
        adminSendMsgToBridge({
          senderType: SenderType.PLATFORM_ADMIN, senderId: user.identityId,
          category: messageTypeData.category, messageType: messageTypeData.type,
          targetType, targetIds, noticeTypes, title, content,
        });
      }

      return;
    },

    async listMessages(req, context) {
      const { userId, category, noticeType, messageType, readStatus, page, pageSize } = req;

      const user = userId ? await getUser(userId, logger) : await checkAuth(context);

      if (!user) {
        throw new ConnectError(`user ${userId} does not exists.`, Code.InvalidArgument);
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

    async markAllMessagesRead(req, context) {
      const { userId } = req;

      const user = userId ? await getUser(userId, logger) : await checkAuth(context);

      if (!user) {
        throw new ConnectError(`user ${userId} does not exists.`, Code.InvalidArgument);
      }

      const em = await forkEntityManager();

      // 查询用户所有的消息
      const messages = await em.find(Message, {
        $or: [
          { messageTarget: { targetType: TargetType.FULL_SITE } },
          { messageTarget: { targetType: TargetType.TENANT, targetId: user.tenant } },
          { messageTarget: { targetType: TargetType.ACCOUNT, targetId:
          { $in: user.accountAffiliations.map((a) => a.accountName) } } },
          { messageTarget: { targetType: TargetType.USER, targetId: user.identityId } },
        ],
      });

      const messageIds = messages.map((message) => message.id);

      const userReadRecords = await em.find(UserMessageRead, {
        userId: user.identityId, message: { id: { $in: messageIds } } });

      for (const message of messages) {
        const userReadRecord = userReadRecords.find((record) => record.message.id === message.id);

        if (!userReadRecord) {
          const newReadRecord = new UserMessageRead({
            userId: user.identityId, message, readTime: new Date(), status: EntityReadStatus.READ });

          em.persist(newReadRecord);
        } else {
          if (userReadRecord.status === EntityReadStatus.UNREAD) {
            userReadRecord.status = EntityReadStatus.READ;
            userReadRecord.readTime = new Date();
            em.persist(userReadRecord);
          }
        }
      }

      await em.flush();
      // await deleteKeys([`${unreadMessageCountPrefixKey}${user.identityId}`]);

      return;
    },

    async deleteMessages(req, context) {
      const { userId, messageIds } = req;

      const user = userId ? await getUser(userId, logger) : await checkAuth(context);

      if (!user) {
        throw new ConnectError(`user ${userId} does not exists.`, Code.InvalidArgument);
      }

      const em = await forkEntityManager();

      const userReadRecords = await em.find(UserMessageRead, {
        userId: user.identityId,
        message: { id: { $in: messageIds.map((id) => Number(id)) } },
      });

      for (const id of messageIds) {
        const record = userReadRecords.find((record) => record.message.id === Number(id));
        if (record) {
          record.isDeleted = true;
          em.persist(record);
        } else {
          const message = await em.findOne(Message, { id: Number(id) });
          if (!message) {
            throw new ConnectError(`message ${id} does not exists`, Code.InvalidArgument);
          }

          const newRecord = new UserMessageRead({
            userId: user.identityId,
            message,
            status: ReadStatus.READ,
            isDeleted: true,
            readTime: new Date(),
          });
          em.persist(newRecord);
        }
      }

      await em.flush();


      // await deleteKeys([`${unreadMessageCountPrefixKey}${user.identityId}`]);

      return;
    },

    async deleteAllReadMessages(req, context) {

      const { userId } = req;

      const user = userId ? await getUser(userId, logger) : await checkAuth(context);

      if (!user) {
        throw new ConnectError(`user ${userId} does not exists.`, Code.InvalidArgument);
      }

      const em = await forkEntityManager();
      // 删除所有用户已读消息

      // step 1. 找到所有用户已读的消息
      const messages = await em.find(Message, {
        $or: [
          { messageTarget: { targetType: TargetType.FULL_SITE } },
          { messageTarget: { targetType: TargetType.TENANT, targetId: user.tenant } },
          { messageTarget: { targetType: TargetType.ACCOUNT, targetId:
            { $in: user.accountAffiliations.map((a) => a.accountName) } } },
          { messageTarget: { targetType: TargetType.USER, targetId: user.identityId } },
        ],
      });

      const messageIds = messages.map((message) => message.id);

      const userReadRecords = await em.find(UserMessageRead, {
        userId: user.identityId, status: ReadStatus.READ, message: { id: { $in: messageIds } } });

      for (const record of userReadRecords) {
        record.isDeleted = true;

        em.persist(record);
      }

      await em.flush();

      // await deleteKeys([`${unreadMessageCountPrefixKey}${user.identityId}`]);

      return;

    },
  });
};
