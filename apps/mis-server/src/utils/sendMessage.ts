import { Struct } from "@bufbuild/protobuf";
import { Logger } from "@ddadaal/tsgrpc-server";
import { TargetType } from "@scow/notification-protos/build/message_common_pb";
import {
  MessageData,
  SystemBatchSendMessagesRequest,
  SystemSendMessageRequest } from "@scow/notification-protos/build/scow_message_pb";
import { notifClient } from "src/config/notification";
import { InternalMessageType } from "src/models/messageType";

interface BaseMessage {
  targetIds: string[];
}

interface AccountOverdue extends BaseMessage {
  messageType: InternalMessageType.AccountOverdue;
  targetType: TargetType.USER,
  metadata: {
    time: string;
    accountName: string;
    amount: string;
  };
}

interface AccountRechargeSuccess extends BaseMessage {
  messageType: InternalMessageType.AccountRechargeSuccess;
  targetType: TargetType.USER,
  metadata: {
    time: string;
    accountName: string;
    chargeAmount: string;
    amount: string;
  };
}

interface AccountLowBalance extends BaseMessage {
  messageType: InternalMessageType.AccountLowBalance;
  targetType: TargetType.USER,
  metadata: {
    time: string;
    accountName: string;
  };
}

interface AccountBalance extends BaseMessage {
  messageType: InternalMessageType.AccountBalance;
  targetType: TargetType.USER,
  metadata: {
    accountName: string;
    amount: string;
    balance: string;
  };
}

interface AccountLocked extends BaseMessage {
  messageType: InternalMessageType.AccountLocked;
  targetType: TargetType.USER,
  metadata: {
    time: string;
    accountName: string;
  };
}

interface AccountUnblocked extends BaseMessage {
  messageType: InternalMessageType.AccountUnblocked;
  targetType: TargetType.USER,
  metadata: {
    time: string;
    accountName: string;
  };
}

interface JobFinished extends BaseMessage {
  messageType: InternalMessageType.JobFinished;
  targetType: TargetType.USER,
  metadata: {
    time: string;
    jobId: string;
    jobName: string;
    cluster: string;
    account: string;
    price: string;
  };
}

export type Message = AccountLocked | AccountOverdue | AccountRechargeSuccess
  | AccountLowBalance | AccountBalance | AccountUnblocked
  | JobFinished;

export const sendMessage = async (message: Message, logger: Logger) => {
  const { metadata } = message;

  const data: Partial<SystemSendMessageRequest> = {
    ...message,
    systemId: "MIS_SERVER", metadata: Struct.fromJson(metadata),
  };

  try {
    logger.info(`send ${message.messageType} message to ${message.targetType} ${message.targetIds.toString()}`);
    await notifClient?.scowMessage.systemSendMessage(data);
  } catch (err) {
    logger.error(`send message ${JSON.stringify(data)} err: ${err as any}`);
  }
};

// 按批次发送消息
export const batchSendMessages = async (messages: Message[], logger: Logger, batchSize = 100) => {

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize); // 获取当前批次的消息

    const data: Partial<SystemBatchSendMessagesRequest> = {
      systemId: "MIS_SERVER",
      messages: batch.map((msg) => {
        const { metadata } = msg;
        return {
          ...msg,
          metadata: Struct.fromJson(metadata),
        } as MessageData;
      }),
    };

    try {
      logger.info(`send ${data.messages?.length} messages to notification`);
      await notifClient?.scowMessage.systemBatchSendMessages(data);
    } catch (err) {
      logger.error(`send message ${JSON.stringify(data)} err: ${err as any}`);
    }
  }
};
