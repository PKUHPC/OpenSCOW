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
import { Logger } from "@ddadaal/tsgrpc-server";
import { TargetType } from "@scow/notification-protos/build/message_common_pb";
import { SystemSendMessageRequest } from "@scow/notification-protos/build/scow_message_pb";
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

type Message = AccountLocked | AccountOverdue | AccountRechargeSuccess
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
