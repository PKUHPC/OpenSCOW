import type { ServiceType } from "@bufbuild/protobuf";
import { createPromiseClient, Interceptor, PromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { getCommonConfig } from "@scow/config/build/common";
import { MessageBridgeService } from "@scow/notification-protos/build/message_bridge_connect";
import { MessageConfigService } from "@scow/notification-protos/build/message_config_connect";
import { MessageService } from "@scow/notification-protos/build/message_connect";
import { MessageTypeService } from "@scow/notification-protos/build/message_type_connect";
import { ScowMessageService } from "@scow/notification-protos/build/scow_message_connect";
import { UserSubscriptionService } from "@scow/notification-protos/build/user_subscription_connect";
import { join } from "path";

const setAuthorization: Interceptor = (next) => async (req) => {
  const commonConfig = getCommonConfig();
  const token = commonConfig.scowApi?.auth?.token;

  if (token) {
    req.header.set("authorization", `Bearer ${token}`);
  }
  return next(req);
};

export interface NotificationClient {
  scowMessage: PromiseClient<typeof ScowMessageService>;
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
    interceptors: [setAuthorization],
  });
  return createPromiseClient(service, transport);
}

export const getNotificationNodeClient = (notificationUrl: string) => {
  return {
    scowMessage: getClient(notificationUrl, ScowMessageService),
    message: getClient(notificationUrl, MessageService),
    messageConfig: getClient(notificationUrl, MessageConfigService),
    messageType: getClient(notificationUrl, MessageTypeService),
    userSubscription: getClient(notificationUrl, UserSubscriptionService),
    messageBridge: getClient(notificationUrl, MessageBridgeService),
  } as NotificationClient;
};
