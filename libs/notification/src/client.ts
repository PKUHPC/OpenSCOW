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

import type { ServiceType } from "@bufbuild/protobuf";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { MessageBridgeService } from "@scow/notification-protos/build/message_bridge_connect";
import { MessageConfigService } from "@scow/notification-protos/build/message_config_connect";
import { MessageService } from "@scow/notification-protos/build/message_connect";
import { MessageTypeService } from "@scow/notification-protos/build/message_type_connect";
import { UserSubscriptionService } from "@scow/notification-protos/build/user_subscription_connect";
import { join } from "path";

export interface NotificationClient {
  message: PromiseClient<typeof MessageService>;
  messageConfig: PromiseClient<typeof MessageConfigService>;
  messageType: PromiseClient<typeof MessageTypeService>;
  userSubscription: PromiseClient<typeof UserSubscriptionService>;
  messageBridge: PromiseClient<typeof MessageBridgeService>;
}

export function getClient<TService extends ServiceType>(
  notificationUrl: string, service: TService,
): PromiseClient<TService> {
  const transport = createConnectTransport({
    baseUrl: join(notificationUrl, "api"),
    httpVersion: "1.1",
  });
  return createPromiseClient(service, transport);
}

export const getNotificationNodeClient = (notificationUrl: string) => {
  return {
    message: getClient(notificationUrl, MessageService),
    messageConfig: getClient(notificationUrl, MessageConfigService),
    messageType: getClient(notificationUrl, MessageTypeService),
    userSubscription: getClient(notificationUrl, UserSubscriptionService),
    messageBridge: getClient(notificationUrl, MessageBridgeService),
  } as NotificationClient;
};
